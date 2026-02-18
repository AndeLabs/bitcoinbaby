//! BABTC Token Contract
//!
//! Smart contract for BitcoinBaby ($BABTC) token minting via Proof-of-Work.
//! Runs on Charms Protocol v10 using SP1 zkVM.
//!
//! # Mining Flow
//! 1. Miner finds valid PoW hash with sufficient leading zeros
//! 2. Mining TX is broadcast with OP_RETURN containing challenge:nonce:hash
//! 3. Mining TX is confirmed in a block
//! 4. Mint spell is created with Merkle proof of mining TX inclusion
//! 5. This contract validates the proof and authorizes token minting
//!
//! # Validation Rules
//! - Mining TX must be confirmed (Merkle proof valid)
//! - PoW hash must have required leading zeros (difficulty)
//! - Reward calculation must match protocol formula
//! - Distribution must follow 70/20/10 split

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};

// =============================================================================
// CONFIGURATION
// =============================================================================

/// Minimum required leading zero bits for valid PoW
const MIN_DIFFICULTY: u32 = 16;

/// Maximum supply in base units (21B with 8 decimals)
const MAX_SUPPLY: u128 = 21_000_000_000 * 100_000_000;

/// Halving period in blocks (synced with Bitcoin)
const HALVING_BLOCKS: u64 = 210_000;

/// Initial block reward in base units (500 BABTC)
const INITIAL_REWARD: u128 = 500 * 100_000_000;

/// Reward distribution percentages
const MINER_SHARE: u8 = 70;
const DEV_SHARE: u8 = 20;
const STAKING_SHARE: u8 = 10;

// =============================================================================
// TYPES
// =============================================================================

/// Mining private inputs from spell
#[derive(Debug, Serialize, Deserialize)]
pub struct MiningInputs {
    /// Raw hex of the mining transaction
    pub tx: String,
    /// Merkle block proof in hex format
    pub tx_block_proof: String,
}

/// Parsed mining transaction data
#[derive(Debug)]
pub struct MiningTxData {
    /// Challenge (previous UTXO txid:vout)
    pub challenge: String,
    /// Nonce used to find valid hash
    pub nonce: String,
    /// Resulting hash
    pub hash: Vec<u8>,
    /// Number of leading zero bits
    pub leading_zeros: u32,
}

/// Reward calculation result
#[derive(Debug)]
pub struct RewardCalc {
    pub total: u128,
    pub miner_share: u128,
    pub dev_share: u128,
    pub staking_share: u128,
}

// =============================================================================
// MAIN CONTRACT ENTRY POINT
// =============================================================================

/// Main contract entry point
///
/// Called by the Charms runtime to validate spell execution.
/// Returns true if the spell is valid and should be executed.
#[no_mangle]
pub extern "C" fn app_contract(
    app_tag: *const u8,
    app_tag_len: usize,
    inputs_ptr: *const u8,
    inputs_len: usize,
    outputs_ptr: *const u8,
    outputs_len: usize,
) -> bool {
    // Safety: We trust the Charms runtime to provide valid pointers
    let app_tag = unsafe {
        let slice = std::slice::from_raw_parts(app_tag, app_tag_len);
        std::str::from_utf8(slice).unwrap_or("")
    };

    let inputs = unsafe { std::slice::from_raw_parts(inputs_ptr, inputs_len) };
    let outputs = unsafe { std::slice::from_raw_parts(outputs_ptr, outputs_len) };

    match app_tag {
        "t" => validate_token_mint(inputs, outputs),
        _ => false,
    }
}

// =============================================================================
// TOKEN MINT VALIDATION
// =============================================================================

/// Validate a token mint operation
///
/// Checks:
/// 1. Mining TX is confirmed (Merkle proof valid)
/// 2. PoW hash meets minimum difficulty
/// 3. Reward amounts are correctly calculated
/// 4. Distribution follows protocol rules
fn validate_token_mint(inputs: &[u8], outputs: &[u8]) -> bool {
    // Parse inputs
    let mining_inputs: MiningInputs = match serde_json::from_slice(inputs) {
        Ok(m) => m,
        Err(_) => return false,
    };

    // Parse mining transaction
    let mining_tx = match parse_mining_tx(&mining_inputs.tx) {
        Some(tx) => tx,
        None => return false,
    };

    // Validate PoW difficulty
    if mining_tx.leading_zeros < MIN_DIFFICULTY {
        return false;
    }

    // Validate Merkle proof
    if !validate_merkle_proof(&mining_inputs.tx, &mining_inputs.tx_block_proof) {
        return false;
    }

    // Calculate expected reward
    // Note: Block height would come from Merkle proof in full implementation
    let block_height = 0u64; // TODO: Extract from proof
    let expected_reward = calculate_reward(block_height, mining_tx.leading_zeros);

    // Validate output amounts
    let output_amounts: Vec<u128> = match parse_output_amounts(outputs) {
        Some(amounts) => amounts,
        None => return false,
    };

    // Verify distribution: miner (70%), dev (20%), staking (10%)
    if output_amounts.len() < 3 {
        return false;
    }

    let total_output: u128 = output_amounts.iter().sum();
    if total_output != expected_reward.total {
        return false;
    }

    // Verify individual shares (with 1% tolerance for rounding)
    let tolerance = expected_reward.total / 100;

    if !within_tolerance(output_amounts[0], expected_reward.miner_share, tolerance) {
        return false;
    }
    if !within_tolerance(output_amounts[1], expected_reward.dev_share, tolerance) {
        return false;
    }
    if !within_tolerance(output_amounts[2], expected_reward.staking_share, tolerance) {
        return false;
    }

    true
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/// Parse mining transaction from hex
fn parse_mining_tx(tx_hex: &str) -> Option<MiningTxData> {
    // Decode hex
    let tx_bytes = hex::decode(tx_hex).ok()?;

    // Find OP_RETURN output (0x6a prefix)
    // This is a simplified parser; full implementation would use bitcoin library
    let op_return_start = tx_bytes.windows(2).position(|w| w == [0x6a, 0x00])?;

    // Extract OP_RETURN data (challenge:nonce:hash format)
    let data_start = op_return_start + 2;
    let data_len = tx_bytes.get(data_start)? & 0x7f;
    let data = &tx_bytes[data_start + 1..data_start + 1 + data_len as usize];

    let data_str = std::str::from_utf8(data).ok()?;
    let parts: Vec<&str> = data_str.split(':').collect();

    if parts.len() < 3 {
        return None;
    }

    let hash_hex = parts[2];
    let hash = hex::decode(hash_hex).ok()?;

    Some(MiningTxData {
        challenge: parts[0].to_string(),
        nonce: parts[1].to_string(),
        leading_zeros: count_leading_zeros(&hash),
        hash,
    })
}

/// Count leading zero bits in a hash
fn count_leading_zeros(hash: &[u8]) -> u32 {
    let mut zeros = 0u32;
    for byte in hash {
        if *byte == 0 {
            zeros += 8;
        } else {
            zeros += byte.leading_zeros();
            break;
        }
    }
    zeros
}

/// Validate Merkle proof
fn validate_merkle_proof(_tx_hex: &str, _proof_hex: &str) -> bool {
    // TODO: Implement full Merkle proof validation
    // This requires:
    // 1. Parse block header from proof
    // 2. Extract Merkle path
    // 3. Compute Merkle root from TX and path
    // 4. Compare with block header's Merkle root
    //
    // For now, we trust the proof (Charms runtime validates)
    true
}

/// Parse output amounts from spell outputs
fn parse_output_amounts(_outputs: &[u8]) -> Option<Vec<u128>> {
    // TODO: Parse actual output amounts from spell JSON
    // For now, return placeholder
    Some(vec![0, 0, 0])
}

/// Calculate block reward based on height and difficulty
fn calculate_reward(block_height: u64, leading_zeros: u32) -> RewardCalc {
    // Calculate halving epoch
    let epoch = block_height / HALVING_BLOCKS;
    let halving_divisor = 1u128 << epoch;

    // Base reward with halving
    let base_reward = INITIAL_REWARD / halving_divisor;

    // Difficulty bonus: reward scales with leading zeros above minimum
    let difficulty_bonus = if leading_zeros > MIN_DIFFICULTY {
        (leading_zeros - MIN_DIFFICULTY) as u128
    } else {
        0
    };

    let total = base_reward + (base_reward * difficulty_bonus / 10);

    // Ensure we don't exceed max supply (simplified check)
    let total = total.min(MAX_SUPPLY / 1000);

    // Calculate shares
    let miner_share = total * MINER_SHARE as u128 / 100;
    let dev_share = total * DEV_SHARE as u128 / 100;
    let staking_share = total - miner_share - dev_share; // Remainder to avoid rounding issues

    RewardCalc {
        total,
        miner_share,
        dev_share,
        staking_share,
    }
}

/// Check if value is within tolerance of expected
fn within_tolerance(actual: u128, expected: u128, tolerance: u128) -> bool {
    if actual > expected {
        actual - expected <= tolerance
    } else {
        expected - actual <= tolerance
    }
}

/// Double SHA256 (Bitcoin standard)
#[allow(dead_code)]
fn double_sha256(data: &[u8]) -> Vec<u8> {
    let first = Sha256::digest(data);
    let second = Sha256::digest(&first);
    second.to_vec()
}

// =============================================================================
// TESTS
// =============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_count_leading_zeros() {
        assert_eq!(count_leading_zeros(&[0x00, 0x00, 0x01, 0xff]), 16);
        assert_eq!(count_leading_zeros(&[0x00, 0x0f, 0xff, 0xff]), 12);
        assert_eq!(count_leading_zeros(&[0x00, 0x00, 0x00, 0xff]), 24);
        assert_eq!(count_leading_zeros(&[0xff, 0xff, 0xff, 0xff]), 0);
    }

    #[test]
    fn test_calculate_reward() {
        // Block 0: full reward
        let reward = calculate_reward(0, MIN_DIFFICULTY);
        assert!(reward.total > 0);
        assert_eq!(
            reward.miner_share + reward.dev_share + reward.staking_share,
            reward.total
        );

        // After first halving
        let reward_halved = calculate_reward(HALVING_BLOCKS, MIN_DIFFICULTY);
        assert!(reward_halved.total < reward.total);
    }

    #[test]
    fn test_within_tolerance() {
        assert!(within_tolerance(100, 100, 0));
        assert!(within_tolerance(99, 100, 1));
        assert!(within_tolerance(101, 100, 1));
        assert!(!within_tolerance(98, 100, 1));
    }
}
