/**
 * Spell Encoder
 *
 * Encodes Charms spells for inclusion in Bitcoin transactions.
 * Spells are encoded in the witness field using Taproot script path.
 *
 * Format: OP_FALSE OP_IF <spell_data> OP_ENDIF
 * This creates a no-op script that carries the spell data.
 */

import type { SpellConfig } from "../scrolls/types";
import type { SpellV2, SpellV10 } from "../charms/types";
import { stringifyWithBigInt } from "../utils";

// Spell type union - supports v1, v2, and v10 formats
type Spell = SpellConfig | SpellV2 | SpellV10;

// Charms magic bytes identifier
const CHARMS_MAGIC = new Uint8Array([0x43, 0x48, 0x52, 0x4d]); // "CHRM"

// Protocol version
const PROTOCOL_VERSION = 0x01;

// Bitcoin script opcodes
const OP_FALSE = 0x00;
const OP_IF = 0x63;
const OP_ENDIF = 0x68;
const OP_PUSHDATA1 = 0x4c;
const OP_PUSHDATA2 = 0x4d;

/**
 * Encode a spell for inclusion in witness
 *
 * The spell is wrapped in OP_FALSE OP_IF ... OP_ENDIF to create
 * a no-op script that Bitcoin validates but doesn't execute.
 */
export function encodeSpellForWitness(spell: Spell): Uint8Array {
  // Serialize spell to JSON
  const spellJson = stringifyWithBigInt(spell);
  const encoder = new TextEncoder();
  const spellBytes = encoder.encode(spellJson);

  // Build payload: MAGIC + VERSION + SPELL_DATA
  const payload = new Uint8Array(CHARMS_MAGIC.length + 1 + spellBytes.length);
  payload.set(CHARMS_MAGIC, 0);
  payload[CHARMS_MAGIC.length] = PROTOCOL_VERSION;
  payload.set(spellBytes, CHARMS_MAGIC.length + 1);

  // Wrap in OP_FALSE OP_IF <data> OP_ENDIF
  return wrapInEnvelope(payload);
}

/**
 * Wrap data in OP_FALSE OP_IF ... OP_ENDIF envelope
 */
function wrapInEnvelope(data: Uint8Array): Uint8Array {
  const pushData = createPushData(data);

  // OP_FALSE + OP_IF + pushData + OP_ENDIF
  const result = new Uint8Array(1 + 1 + pushData.length + 1);
  let offset = 0;

  result[offset++] = OP_FALSE;
  result[offset++] = OP_IF;
  result.set(pushData, offset);
  offset += pushData.length;
  result[offset] = OP_ENDIF;

  return result;
}

/**
 * Create push data script for arbitrary data
 */
function createPushData(data: Uint8Array): Uint8Array {
  const length = data.length;

  if (length <= 75) {
    // Direct push: length byte + data
    const result = new Uint8Array(1 + length);
    result[0] = length;
    result.set(data, 1);
    return result;
  } else if (length <= 255) {
    // OP_PUSHDATA1: opcode + 1-byte length + data
    const result = new Uint8Array(2 + length);
    result[0] = OP_PUSHDATA1;
    result[1] = length;
    result.set(data, 2);
    return result;
  } else if (length <= 65535) {
    // OP_PUSHDATA2: opcode + 2-byte length (little-endian) + data
    const result = new Uint8Array(3 + length);
    result[0] = OP_PUSHDATA2;
    result[1] = length & 0xff;
    result[2] = (length >> 8) & 0xff;
    result.set(data, 3);
    return result;
  } else {
    throw new Error("Spell data too large (max 65535 bytes)");
  }
}

/**
 * Decode a spell from witness data
 */
export function decodeSpellFromWitness(
  witness: Uint8Array,
): SpellConfig | null {
  // Find OP_FALSE OP_IF pattern
  let offset = 0;

  // Skip to OP_FALSE OP_IF
  while (offset < witness.length - 1) {
    if (witness[offset] === OP_FALSE && witness[offset + 1] === OP_IF) {
      offset += 2;
      break;
    }
    offset++;
  }

  if (offset >= witness.length) {
    return null;
  }

  // Extract push data
  const data = extractPushData(witness, offset);
  if (!data) {
    return null;
  }

  // Verify magic bytes
  if (data.length < CHARMS_MAGIC.length + 1) {
    return null;
  }

  for (let i = 0; i < CHARMS_MAGIC.length; i++) {
    if (data[i] !== CHARMS_MAGIC[i]) {
      return null;
    }
  }

  // Skip version byte
  const spellStart = CHARMS_MAGIC.length + 1;

  // Decode JSON
  try {
    const decoder = new TextDecoder();
    const spellJson = decoder.decode(data.slice(spellStart));
    return JSON.parse(spellJson) as SpellConfig;
  } catch {
    return null;
  }
}

/**
 * Extract push data from script
 */
function extractPushData(
  script: Uint8Array,
  offset: number,
): Uint8Array | null {
  if (offset >= script.length) {
    return null;
  }

  const opcode = script[offset];

  if (opcode <= 75) {
    // Direct push
    const length = opcode;
    if (offset + 1 + length > script.length) {
      return null;
    }
    return script.slice(offset + 1, offset + 1 + length);
  } else if (opcode === OP_PUSHDATA1) {
    if (offset + 2 > script.length) {
      return null;
    }
    const length = script[offset + 1];
    if (offset + 2 + length > script.length) {
      return null;
    }
    return script.slice(offset + 2, offset + 2 + length);
  } else if (opcode === OP_PUSHDATA2) {
    if (offset + 3 > script.length) {
      return null;
    }
    const length = script[offset + 1] | (script[offset + 2] << 8);
    if (offset + 3 + length > script.length) {
      return null;
    }
    return script.slice(offset + 3, offset + 3 + length);
  }

  return null;
}

/**
 * Create OP_RETURN output for spell reference
 * Used when spell is too large for witness
 */
export function createSpellOpReturn(spell: Spell): Uint8Array {
  const spellJson = stringifyWithBigInt(spell);
  const encoder = new TextEncoder();
  const spellBytes = encoder.encode(spellJson);

  // OP_RETURN limit is 80 bytes, but we use this for small references
  const payload = new Uint8Array(CHARMS_MAGIC.length + 1 + spellBytes.length);
  payload.set(CHARMS_MAGIC, 0);
  payload[CHARMS_MAGIC.length] = PROTOCOL_VERSION;
  payload.set(spellBytes, CHARMS_MAGIC.length + 1);

  return payload;
}

/**
 * Calculate the size of encoded spell
 */
export function calculateSpellSize(spell: Spell): number {
  const spellJson = stringifyWithBigInt(spell);
  const spellBytes = new TextEncoder().encode(spellJson);

  // MAGIC (4) + VERSION (1) + JSON
  const payloadSize = CHARMS_MAGIC.length + 1 + spellBytes.length;

  // Envelope overhead: OP_FALSE (1) + OP_IF (1) + pushdata + OP_ENDIF (1)
  let pushDataOverhead = 1; // length byte for <= 75
  if (payloadSize > 75 && payloadSize <= 255) {
    pushDataOverhead = 2; // OP_PUSHDATA1 + length
  } else if (payloadSize > 255) {
    pushDataOverhead = 3; // OP_PUSHDATA2 + 2-byte length
  }

  return 1 + 1 + pushDataOverhead + payloadSize + 1;
}

/**
 * Validate spell structure
 */
export function validateSpell(spell: SpellConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!spell.version) {
    errors.push("Spell version is required");
  }

  if (!spell.app) {
    errors.push("Spell app identifier is required");
  }

  if (!Array.isArray(spell.outputs) || spell.outputs.length === 0) {
    errors.push("Spell must have at least one output");
  }

  // Validate outputs
  for (const output of spell.outputs || []) {
    if (!output.type) {
      errors.push("Output type is required");
    }
    if (!["mint", "transfer", "burn"].includes(output.type)) {
      errors.push(`Invalid output type: ${output.type}`);
    }
    if (output.type === "mint" && !output.address) {
      errors.push("Mint output requires recipient address");
    }
  }

  // Check size limit
  const size = calculateSpellSize(spell);
  if (size > 10000) {
    errors.push(`Spell too large: ${size} bytes (max 10000)`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
