# BABTC Contract Build & Deploy

## Prerequisites

1. **Rust toolchain**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   rustup target add wasm32-unknown-unknown
   ```

2. **Charms CLI**
   ```bash
   cargo install --locked charms
   ```

3. **SP1 zkVM SDK** (for proof generation)
   Follow instructions at: https://docs.charms.dev/getting-started/

## Build Contract

```bash
cd packages/bitcoin/contracts/babtc

# Build WASM binary
cargo build --release --target wasm32-unknown-unknown

# Output: target/wasm32-unknown-unknown/release/babtc_contract.wasm
```

## Generate Verification Key

```bash
# Hash the WASM binary to get the verification key
sha256sum target/wasm32-unknown-unknown/release/babtc_contract.wasm
```

## Deploy to Testnet4

1. **Create Genesis UTXO**
   Send a small amount of tBTC to a new address to create the genesis UTXO.

2. **Deploy App**
   ```bash
   charms deploy \
     --network testnet4 \
     --wasm target/wasm32-unknown-unknown/release/babtc_contract.wasm \
     --genesis-utxo <txid>:<vout>
   ```

3. **Save App ID and VK**
   The deploy command outputs:
   - App ID: SHA256 of genesis UTXO
   - VK: SHA256 of WASM binary

4. **Update TypeScript Config**
   Update `packages/bitcoin/src/charms/token.ts`:
   ```typescript
   export const BABTC_DEPLOYED = {
     appId: '<your_app_id>',
     appVk: '<your_vk>',
   };
   ```

## Test on Testnet4

1. Get testnet4 tBTC from a faucet
2. Start mining in the app
3. Find a valid share
4. Submit mining TX
5. Wait for confirmation
6. Submit mint spell
7. Verify balance in Charms explorer

## Contract Verification

The contract validates:
- Mining TX inclusion via Merkle proof
- PoW difficulty (minimum 16 leading zeros)
- Reward calculation per halving schedule
- Distribution: 70% miner, 20% dev, 10% staking

## Troubleshooting

### Build fails with "charms-sdk not found"
```bash
# Add Charms crates.io registry
echo '[registries.charms]' >> ~/.cargo/config.toml
echo 'index = "https://github.com/CharmsDev/crates-index"' >> ~/.cargo/config.toml
```

### Proof generation fails
Ensure SP1 zkVM is properly installed and configured.
Check: https://docs.charms.dev/troubleshooting/
