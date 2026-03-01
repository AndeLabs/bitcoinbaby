/**
 * JSON Utilities
 *
 * Safe JSON serialization with BigInt support.
 * Used throughout the codebase for spell encoding and API communication.
 */

/**
 * Custom JSON replacer that converts BigInt to string
 * BigInt cannot be serialized with standard JSON.stringify()
 */
export function bigIntReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

/**
 * Custom JSON reviver that converts numeric strings back to BigInt
 * Use this when parsing JSON that may contain BigInt values
 */
export function bigIntReviver(_key: string, value: unknown): unknown {
  // Check if value looks like a big integer (more than 15 digits)
  if (
    typeof value === "string" &&
    /^-?\d{16,}$/.test(value) &&
    !isNaN(Number(value))
  ) {
    return BigInt(value);
  }
  return value;
}

/**
 * Stringify with BigInt support
 * Converts BigInt values to strings during serialization
 *
 * @example
 * ```ts
 * const obj = { amount: 1000000000000000000n };
 * const json = stringifyWithBigInt(obj);
 * // '{"amount":"1000000000000000000"}'
 * ```
 */
export function stringifyWithBigInt(
  value: unknown,
  space?: string | number,
): string {
  return JSON.stringify(value, bigIntReplacer, space);
}

/**
 * Parse with BigInt support
 * Converts large numeric strings back to BigInt during parsing
 *
 * @example
 * ```ts
 * const json = '{"amount":"1000000000000000000"}';
 * const obj = parseWithBigInt(json);
 * // { amount: 1000000000000000000n }
 * ```
 */
export function parseWithBigInt<T = unknown>(json: string): T {
  return JSON.parse(json, bigIntReviver) as T;
}

/**
 * Safe stringify that handles circular references and BigInt
 * Falls back to [Circular] for circular references
 */
export function safeStringify(value: unknown, space?: string | number): string {
  const seen = new WeakSet();

  return JSON.stringify(
    value,
    (_key, val) => {
      // Handle BigInt
      if (typeof val === "bigint") {
        return val.toString();
      }

      // Handle circular references
      if (typeof val === "object" && val !== null) {
        if (seen.has(val)) {
          return "[Circular]";
        }
        seen.add(val);
      }

      return val;
    },
    space,
  );
}
