/**
 * Debug key derivation
 */

import * as bitcoin from "bitcoinjs-lib";
import * as ecc from "tiny-secp256k1";
import { getPublicKey } from "../src/crypto";

bitcoin.initEccLib(ecc);

const TESTNET_PRIVATE_KEY =
  "17204f40409a85b8a9b7a4b7bb1081917adf770779c2e55959e14e9da62a766b";
const TESTNET_ADDRESS =
  "tb1pdwap35ru90az875gghz58x9nut7gwqnzjh3dr3cgfdfkxkujt6zqy8ptxj";

const privateKey = Buffer.from(TESTNET_PRIVATE_KEY, "hex");

// Derive public key using our method
const publicKey = getPublicKey(privateKey);
console.log("Compressed public key:", Buffer.from(publicKey).toString("hex"));
console.log("Length:", publicKey.length);

// Extract x-only (internal key)
const xOnlyPubKey = publicKey.slice(1, 33);
console.log(
  "\nX-only public key (internal):",
  Buffer.from(xOnlyPubKey).toString("hex"),
);

// Compute tweaked public key
const tweakHash = bitcoin.crypto.taggedHash(
  "TapTweak",
  Buffer.from(xOnlyPubKey),
);
console.log("Tweak hash:", tweakHash.toString("hex"));

// Add tweak to x-only key to get tweaked key
const tweakedPubKey = ecc.xOnlyPointAddTweak(xOnlyPubKey, tweakHash);
console.log(
  "\nTweaked x-only public key:",
  Buffer.from(tweakedPubKey!.xOnlyPubkey).toString("hex"),
);

// Derive address from tweaked key
const outputScript = Buffer.concat([
  Buffer.from([0x51, 0x20]),
  Buffer.from(tweakedPubKey!.xOnlyPubkey),
]);
const derivedAddress = bitcoin.address.fromOutputScript(
  outputScript,
  bitcoin.networks.testnet,
);
console.log("\nDerived P2TR address:", derivedAddress);
console.log("Expected address:    ", TESTNET_ADDRESS);
console.log("Match:", derivedAddress === TESTNET_ADDRESS);

// Also try using bitcoin.payments.p2tr
const p2tr = bitcoin.payments.p2tr({
  internalPubkey: Buffer.from(xOnlyPubKey),
  network: bitcoin.networks.testnet,
});
console.log("\nP2TR payment address:", p2tr.address);

// Script from address
const scriptFromAddress = bitcoin.address.toOutputScript(
  TESTNET_ADDRESS,
  bitcoin.networks.testnet,
);
console.log("\nScript from address:", scriptFromAddress.toString("hex"));

// Script from P2TR
console.log("Script from P2TR:   ", p2tr.output?.toString("hex"));
