# Genesis Babies NFT System

Complete NFT minting system for Bitcoin using Charms protocol.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NFT MINTING FLOW                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. User clicks "Mint"                                               │
│         ↓                                                            │
│  2. useMintNFT hook checks wallet connection                         │
│         ↓                                                            │
│  3. If no wallet → Demo mode (fake tx)                               │
│     If wallet connected → Real blockchain flow:                      │
│         ↓                                                            │
│  4. Fetch UTXOs from mempool.space API                               │
│         ↓                                                            │
│  5. NFTMintService.createMintPSBT()                                  │
│     - Security validations (address, UTXOs, rate limit)              │
│     - Generate NFT traits from DNA                                   │
│     - Build PSBT with outputs:                                       │
│       [0] Payment to treasury (50,000 sats)                          │
│       [1] NFT to buyer (546 sats dust)                               │
│       [2] Change to buyer                                            │
│       [3] OP_RETURN with Charms spell                                │
│         ↓                                                            │
│  6. Wallet signs PSBT (UniSat/XVerse popup)                          │
│         ↓                                                            │
│  7. Broadcast signed transaction                                     │
│         ↓                                                            │
│  8. Return txid + NFT data to UI                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Configuration

### Testnet4

```typescript
// packages/bitcoin/src/config/testnet4.ts
export const GENESIS_BABIES_TESTNET4 = {
  appId: "c8d4e7f2a1b5c9d3e7f1a5b9c3d7e1f5a9b3c7d1e5f9a3b7c1d5e9f3a7b1c5d9",
  appVk: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  name: "Genesis Babies",
  symbol: "GBABY",
  maxSupply: 10_000,
  priceSats: 50_000n, // ~€50 at current rates
};
```

### Treasury Wallet

```
Address: tb1p7kk2fuf8kv5vjftczlezfded94v9ay9s0h7ggd87k5d5ws744lesw7smmu
Network: testnet4
```

## NFT Traits

### Rarity Tiers
| Tier | Chance | Mining Boost |
|------|--------|--------------|
| Common | 50% | +10% |
| Uncommon | 25% | +25% |
| Rare | 15% | +50% |
| Epic | 7% | +100% |
| Legendary | 2.5% | +150% |
| Mythic | 0.5% | +220% |

### Bloodlines
- Royal (25%)
- Warrior (25%)
- Rogue (25%)
- Mystic (25%)

### Base Types
- Human (70%)
- Animal (15%)
- Mystic (9%)
- Robot (5%)
- Alien (1%)

## Security Validations

### Address Validation
- Network prefix check (tb1 for testnet, bc1 for mainnet)
- bitcoinjs-lib format validation
- Length validation (26-90 characters)

### UTXO Validation
- Required fields: txid, vout, value
- txid format: 64 hex characters
- vout: non-negative integer
- value: positive number, dust threshold warning

### Amount Validation
- No negative values
- Overflow protection (max 21M BTC)
- Fee sanity check (max 1 BTC)

### Rate Limiting
- Max 3 mints per minute per address
- Client-side enforcement

## Usage

### React Hook (useMintNFT)

```tsx
import { useMintNFT } from "@/hooks";

function MintButton() {
  const { mint, preview, isLoading, error, isDemo, lastMinted } = useMintNFT();

  const handleMint = async () => {
    // Preview first
    const previewNFT = preview();
    console.log("Preview:", previewNFT);

    // Mint
    const result = await mint();
    if (result.success) {
      console.log("Minted!", result.txid, result.nft);
    } else {
      console.error("Failed:", result.error);
    }
  };

  return (
    <button onClick={handleMint} disabled={isLoading}>
      {isDemo ? "Mint (Demo)" : "Mint NFT"}
    </button>
  );
}
```

### Direct Service Usage

```typescript
import { createNFTMintService, createMempoolClient } from "@bitcoinbaby/bitcoin";

const mintService = createNFTMintService({ network: "testnet4" });
const mempoolClient = createMempoolClient({ network: "testnet4" });

// Get UTXOs
const utxos = await mempoolClient.getUTXOs(buyerAddress);

// Create PSBT
const result = await mintService.createMintPSBT({
  buyerAddress,
  utxos,
  feeRate: 10,
});

if (result.success) {
  console.log("PSBT created:", result.psbtHex);
  console.log("NFT:", result.nft);
  console.log("Total cost:", result.totalCost);
}
```

## Testing on Testnet4

### 1. Get Test Bitcoin
```bash
# Testnet4 faucet (when available)
# Or use Bitcoin testnet4 mining
```

### 2. Connect Wallet
- Install UniSat or XVerse extension
- Switch to testnet4 network
- Import or create wallet

### 3. Test Mint Flow
1. Open BitcoinBaby app
2. Connect wallet
3. Click "Mint NFT"
4. Approve transaction in wallet
5. Wait for confirmation

### 4. Verify on Explorer
```
https://mempool.space/testnet4/tx/{txid}
```

## Mainnet Checklist

Before mainnet deployment:

- [ ] Generate production App ID and VK via Charms CLI
- [ ] Set up mainnet treasury wallet (hardware wallet recommended)
- [ ] Update GENESIS_BABIES_MAINNET config
- [ ] Audit security validations
- [ ] Test with real funds on testnet
- [ ] Set up monitoring for treasury wallet
- [ ] Configure backup procedures for treasury keys

## Files

| File | Purpose |
|------|---------|
| `packages/bitcoin/src/nft/mint-service.ts` | PSBT creation and spell encoding |
| `packages/bitcoin/src/nft/validation.ts` | Security validations |
| `packages/bitcoin/src/charms/nft.ts` | NFT trait definitions |
| `packages/bitcoin/src/charms/nft-sale.ts` | Pricing configuration |
| `packages/bitcoin/src/config/testnet4.ts` | Network configuration |
| `packages/bitcoin/src/config/treasury.ts` | Treasury address |
| `apps/web/src/hooks/useMintNFT.ts` | React hook for minting |
| `packages/core/src/stores/wallet-store.ts` | Wallet state + signing |
| `packages/core/src/hooks/useWalletProvider.ts` | Wallet connection |

## Transaction Structure

```
Inputs:
  [0..n] Buyer's UTXOs (enough to cover 50,000 + 546 + fee)

Outputs:
  [0] Treasury: 50,000 sats (NFT payment)
  [1] Buyer: 546 sats (NFT output - holds the Charm)
  [2] Buyer: change sats (remaining)
  [3] OP_RETURN: Charms spell data (0 sats)
```

## Spell Structure (Charms v10)

```json
{
  "version": 10,
  "app": "n/{appId}/{appVk}",
  "inputs": [],
  "outputs": [
    {
      "new": {
        "n": {
          "{appId}": {
            "tokenId": 1,
            "dna": "64-char-hex",
            "bloodline": "royal",
            "baseType": "human",
            "rarityTier": "rare",
            "level": 1,
            "xp": 0,
            "totalXp": 0,
            "workCount": 0,
            "evolutionCount": 0
          }
        }
      }
    }
  ]
}
```
