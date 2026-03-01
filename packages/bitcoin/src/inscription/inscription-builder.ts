/**
 * Bitcoin Inscription Builder for Genesis Babies
 *
 * Creates ordinal inscriptions for:
 * 1. Sprite Library (one-time, ~$15-50)
 * 2. On-Chain Renderer (one-time, ~$5-15)
 * 3. Individual NFTs (per mint, ~$0.50-2)
 *
 * Uses Charms protocol for state management.
 */

import * as bitcoin from "bitcoinjs-lib";
import {
  generateRendererInscription,
  generateMinimalNFTInscription,
} from "./onchain-renderer";
import {
  generateLibraryInscription,
  GENESIS_BABIES_LIBRARY,
} from "./sprite-library";

// =============================================================================
// TYPES
// =============================================================================

export interface InscriptionData {
  /** MIME content type */
  contentType: string;
  /** Raw content bytes */
  content: Uint8Array;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

export interface InscriptionResult {
  /** Inscription ID (txid:index) */
  inscriptionId: string;
  /** Transaction ID */
  txid: string;
  /** Output index */
  vout: number;
  /** Fee paid in sats */
  fee: number;
  /** Content size in bytes */
  size: number;
}

export interface InscriptionConfig {
  /** Bitcoin network */
  network: bitcoin.Network;
  /** Fee rate in sat/vB */
  feeRate: number;
  /** Destination address for inscription */
  destinationAddress: string;
  /** Funding UTXO */
  fundingUtxo: {
    txid: string;
    vout: number;
    value: number;
    scriptPubKey: string;
  };
}

export interface BatchInscriptionPlan {
  /** All inscriptions to create */
  inscriptions: Array<{
    name: string;
    type: "library" | "renderer" | "nft";
    data: InscriptionData;
    estimatedFee: number;
  }>;
  /** Total estimated fee in sats */
  totalFee: number;
  /** Total content size in bytes */
  totalSize: number;
  /** Estimated USD cost at current rates */
  estimatedCostUSD: number;
}

// =============================================================================
// INSCRIPTION ENVELOPE
// =============================================================================

/**
 * Ordinals inscription envelope
 * Format: OP_FALSE OP_IF "ord" OP_1 <content-type> OP_0 <content> OP_ENDIF
 */
export function createInscriptionEnvelope(data: InscriptionData): Buffer {
  const parts: Buffer[] = [];

  // Protocol tag
  const ordTag = Buffer.from("ord");

  // Content type
  const contentType = Buffer.from(data.contentType);

  // Content (may be chunked for large data)
  const content = Buffer.from(data.content);

  // Build envelope script
  // OP_FALSE (0x00)
  parts.push(Buffer.from([0x00]));

  // OP_IF (0x63)
  parts.push(Buffer.from([0x63]));

  // Push "ord"
  parts.push(Buffer.from([ordTag.length]));
  parts.push(ordTag);

  // OP_1 for content-type field
  parts.push(Buffer.from([0x51]));

  // Push content type
  parts.push(pushData(contentType));

  // OP_0 for content field
  parts.push(Buffer.from([0x00]));

  // Push content (chunked if > 520 bytes)
  const chunks = chunkBuffer(content, 520);
  for (const chunk of chunks) {
    parts.push(pushData(chunk));
  }

  // OP_ENDIF (0x68)
  parts.push(Buffer.from([0x68]));

  return Buffer.concat(parts);
}

/**
 * Create push data opcode for buffer
 */
function pushData(data: Buffer): Buffer {
  if (data.length <= 75) {
    return Buffer.concat([Buffer.from([data.length]), data]);
  } else if (data.length <= 255) {
    return Buffer.concat([Buffer.from([0x4c, data.length]), data]);
  } else if (data.length <= 65535) {
    const len = Buffer.alloc(2);
    len.writeUInt16LE(data.length);
    return Buffer.concat([Buffer.from([0x4d]), len, data]);
  } else {
    const len = Buffer.alloc(4);
    len.writeUInt32LE(data.length);
    return Buffer.concat([Buffer.from([0x4e]), len, data]);
  }
}

/**
 * Chunk buffer into parts of max size
 */
function chunkBuffer(buffer: Buffer, maxSize: number): Buffer[] {
  const chunks: Buffer[] = [];
  for (let i = 0; i < buffer.length; i += maxSize) {
    chunks.push(buffer.slice(i, Math.min(i + maxSize, buffer.length)));
  }
  return chunks;
}

// =============================================================================
// FEE ESTIMATION
// =============================================================================

/**
 * Estimate inscription fee
 */
export function estimateInscriptionFee(
  contentSize: number,
  feeRate: number,
): number {
  // Base transaction overhead (~150 vB)
  const baseTxSize = 150;

  // Witness data size (content + envelope overhead)
  // Envelope adds ~20 bytes overhead
  const witnessSize = contentSize + 20;

  // Witness discount (1/4 weight)
  const witnessWeight = witnessSize / 4;

  // Total virtual size
  const vsize = baseTxSize + witnessWeight;

  // Fee in sats
  return Math.ceil(vsize * feeRate);
}

/**
 * Estimate cost in USD
 */
export function estimateCostUSD(
  feeSats: number,
  btcPriceUSD: number = 100000,
): number {
  return (feeSats / 100_000_000) * btcPriceUSD;
}

// =============================================================================
// GENESIS BABIES INSCRIPTION PLAN
// =============================================================================

/**
 * Generate complete inscription plan for Genesis Babies
 */
export function generateInscriptionPlan(options: {
  feeRate: number;
  btcPriceUSD?: number;
}): BatchInscriptionPlan {
  const { feeRate, btcPriceUSD = 100000 } = options;

  const inscriptions: BatchInscriptionPlan["inscriptions"] = [];
  let totalSize = 0;
  let totalFee = 0;

  // 1. Sprite Library
  const libraryData = generateLibraryInscription(GENESIS_BABIES_LIBRARY);
  const libraryBytes = new TextEncoder().encode(libraryData.content);
  const libraryFee = estimateInscriptionFee(libraryBytes.length, feeRate);

  inscriptions.push({
    name: "Genesis Babies Sprite Library",
    type: "library",
    data: {
      contentType: libraryData.contentType,
      content: libraryBytes,
    },
    estimatedFee: libraryFee,
  });
  totalSize += libraryBytes.length;
  totalFee += libraryFee;

  // 2. On-Chain Renderer
  const rendererData = generateRendererInscription({
    libraryInscriptionId: "LIBRARY_INSCRIPTION_ID", // Placeholder
    minify: true,
  });
  const rendererBytes = new TextEncoder().encode(rendererData.content);
  const rendererFee = estimateInscriptionFee(rendererBytes.length, feeRate);

  inscriptions.push({
    name: "Genesis Babies Renderer",
    type: "renderer",
    data: {
      contentType: rendererData.contentType,
      content: rendererBytes,
    },
    estimatedFee: rendererFee,
  });
  totalSize += rendererBytes.length;
  totalFee += rendererFee;

  return {
    inscriptions,
    totalFee,
    totalSize,
    estimatedCostUSD: estimateCostUSD(totalFee, btcPriceUSD),
  };
}

/**
 * Generate inscription data for a single NFT
 */
export function generateNFTInscriptionData(params: {
  tokenId: number;
  dna: string;
  rendererInscriptionId: string;
}): InscriptionData {
  const nftData = generateMinimalNFTInscription(params);

  return {
    contentType: nftData.contentType,
    content: new TextEncoder().encode(nftData.content),
  };
}

// =============================================================================
// COMMIT-REVEAL TRANSACTION BUILDER
// =============================================================================

/**
 * Build commit transaction for inscription
 * Commits to the inscription content via P2TR
 */
export function buildCommitTransaction(
  config: InscriptionConfig,
  inscriptionData: InscriptionData,
  internalPubkey: Buffer,
): bitcoin.Psbt {
  const { network, fundingUtxo, destinationAddress, feeRate } = config;

  // Create inscription script
  const inscriptionScript = createInscriptionEnvelope(inscriptionData);

  // Create taproot script tree
  const leafScript = bitcoin.script.compile([
    internalPubkey,
    bitcoin.opcodes.OP_CHECKSIG,
    ...inscriptionScript,
  ]);

  // Calculate output amounts
  const inscriptionFee = estimateInscriptionFee(
    inscriptionData.content.length,
    feeRate,
  );
  const dustLimit = 546;
  const commitOutput = dustLimit + inscriptionFee;
  const change =
    fundingUtxo.value - commitOutput - estimateInscriptionFee(100, feeRate);

  // Build PSBT
  const psbt = new bitcoin.Psbt({ network });

  // Add funding input
  psbt.addInput({
    hash: fundingUtxo.txid,
    index: fundingUtxo.vout,
    witnessUtxo: {
      script: Buffer.from(fundingUtxo.scriptPubKey, "hex"),
      value: fundingUtxo.value,
    },
  });

  // Add commit output (P2TR with script)
  // Note: Actual implementation would use proper taproot construction
  psbt.addOutput({
    address: destinationAddress,
    value: commitOutput,
  });

  // Add change output if sufficient
  if (change > dustLimit) {
    psbt.addOutput({
      address: destinationAddress,
      value: change,
    });
  }

  return psbt;
}

/**
 * Build reveal transaction that exposes inscription
 */
export function buildRevealTransaction(
  config: InscriptionConfig,
  commitTxid: string,
  commitVout: number,
  commitValue: number,
  inscriptionData: InscriptionData,
  internalPubkey: Buffer,
): bitcoin.Psbt {
  const { network, destinationAddress, feeRate } = config;

  const revealFee = estimateInscriptionFee(
    inscriptionData.content.length,
    feeRate,
  );
  const dustLimit = 546;

  const psbt = new bitcoin.Psbt({ network });

  // Add commit output as input
  psbt.addInput({
    hash: commitTxid,
    index: commitVout,
    witnessUtxo: {
      script: Buffer.alloc(0), // Would be actual script
      value: commitValue,
    },
    tapLeafScript: [
      {
        leafVersion: 0xc0,
        script: createInscriptionEnvelope(inscriptionData),
        controlBlock: Buffer.alloc(33), // Would be actual control block
      },
    ],
  });

  // Add inscription output
  psbt.addOutput({
    address: destinationAddress,
    value: Math.max(dustLimit, commitValue - revealFee),
  });

  return psbt;
}

// =============================================================================
// BATCH INSCRIPTION HELPER
// =============================================================================

/**
 * Inscription order for Genesis Babies deployment
 */
export const INSCRIPTION_ORDER = [
  { step: 1, type: "library", description: "Inscribe sprite library (~15KB)" },
  { step: 2, type: "renderer", description: "Inscribe HTML renderer (~5KB)" },
  { step: 3, type: "collection", description: "Create collection inscription" },
  {
    step: 4,
    type: "nfts",
    description: "Inscribe individual NFTs (~50 bytes each)",
  },
] as const;

/**
 * Get deployment summary
 */
export function getDeploymentSummary(feeRate: number = 10): {
  steps: typeof INSCRIPTION_ORDER;
  estimates: {
    libraryFee: number;
    rendererFee: number;
    perNFTFee: number;
    totalInfrastructureFee: number;
    estimatedInfrastructureUSD: number;
    estimatedPerNFTUSD: number;
  };
} {
  // Estimate sizes
  const librarySizeBytes = 15000; // ~15KB
  const rendererSizeBytes = 5000; // ~5KB
  const nftSizeBytes = 100; // ~100 bytes

  const libraryFee = estimateInscriptionFee(librarySizeBytes, feeRate);
  const rendererFee = estimateInscriptionFee(rendererSizeBytes, feeRate);
  const perNFTFee = estimateInscriptionFee(nftSizeBytes, feeRate);
  const totalInfrastructureFee = libraryFee + rendererFee;

  return {
    steps: INSCRIPTION_ORDER,
    estimates: {
      libraryFee,
      rendererFee,
      perNFTFee,
      totalInfrastructureFee,
      estimatedInfrastructureUSD: estimateCostUSD(totalInfrastructureFee),
      estimatedPerNFTUSD: estimateCostUSD(perNFTFee),
    },
  };
}
