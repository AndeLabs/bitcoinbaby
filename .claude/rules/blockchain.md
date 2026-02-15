---
paths:
  - "packages/bitcoin/**/*"
---

# Reglas Blockchain

## Seguridad de Claves
```typescript
// NUNCA hacer esto
console.log(privateKey); // NUNCA logear claves
const key = "L1234..."; // NUNCA hardcodear claves

// Correcto: manejar claves de forma segura
async function signTransaction(tx: Transaction): Promise<SignedTransaction> {
  // Obtener clave de almacenamiento seguro
  const privateKey = await secureStorage.getPrivateKey();

  try {
    return sign(tx, privateKey);
  } finally {
    // Limpiar memoria
    privateKey.fill(0);
  }
}
```

## Transacciones
```typescript
// Siempre validar antes de firmar
async function createTransaction(params: TxParams): Promise<Transaction> {
  // 1. Validar inputs
  if (!isValidAddress(params.to)) {
    throw new Error('Invalid recipient address');
  }

  if (params.amount <= 0) {
    throw new Error('Amount must be positive');
  }

  // 2. Verificar balance
  const balance = await getBalance(params.from);
  const totalCost = params.amount + estimateFee(params);

  if (balance < totalCost) {
    throw new Error('Insufficient funds');
  }

  // 3. Construir transaccion
  return buildTransaction(params);
}
```

## Charms / Scrolls Integration
```typescript
// Usar Scrolls API para consultar balances
async function getTokenBalance(address: string, runeId: string): Promise<bigint> {
  const response = await fetch(
    `${SCROLLS_API}/api/v1/balances/${address}?rune_id=${runeId}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch balance from Scrolls');
  }

  const data = await response.json();
  return BigInt(data.balance);
}

// Crear Spell para mining
const mineSpell = {
  name: 'mine-baby',
  version: '1.0.0',
  operations: [
    {
      type: 'mint',
      token: 'BABY',
      amount: 'calculated',
      recipient: minerAddress,
      proof: workProof,
    }
  ]
};
```

## Testing con Testnet
```typescript
// Siempre usar testnet para desarrollo
const NETWORK = process.env.NODE_ENV === 'production'
  ? bitcoin.networks.bitcoin
  : bitcoin.networks.testnet;

// Faucets para testing
// Bitcoin Testnet: https://coinfaucet.eu/en/btc-testnet/
```
