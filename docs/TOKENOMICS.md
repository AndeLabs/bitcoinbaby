# $BABTC Tokenomics - BitcoinBaby

> Token nativo del ecosistema BitcoinBaby sobre Bitcoin usando Charms Protocol

## Metadata del Token

```json
{
  "decimals": 8,
  "description": "Proof-of-Useful-Work token. Mine by training AI, raise your BitcoinBaby, earn $BABTC.",
  "image": "data:image/png;base64,{PIXEL_ART_BABY_LOGO}",
  "name": "BitcoinBaby",
  "supply_limit": 2100000000000000000,
  "ticker": "BABTC",
  "url": "https://bitcoinbaby.dev"
}
```

### Campos para Charms Explorer

| Campo | Valor | Notas |
|-------|-------|-------|
| `decimals` | 8 | Igual que Bitcoin |
| `ticker` | BABTC | Bitcoin Baby Token Coin |
| `name` | BitcoinBaby | Nombre completo |
| `supply_limit` | 21,000,000,000 BABTC | 21 Billion (21B) |
| `url` | https://bitcoinbaby.dev | Sitio oficial |

## Supply y Distribucion

### Supply Total: 21,000,000,000 BABTC (21 Billion)

**Por que 21 Billion:**
- 1000x Bitcoin = mas unidades para gaming/micropagos
- Psicologicamente accesible (no 0.00001 por accion)
- Mantiene la narrativa "21" de Bitcoin
- Con 8 decimales: 2,100,000,000,000,000,000 unidades base

### Distribucion: Fair Launch (Estilo eCash)

```
Mining Rewards     70%  │████████████████████████████░░░░░░░░░░░░│  14,700,000,000 BABTC
Dev Fund           20%  │████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   4,200,000,000 BABTC
Staking/Liquidity  10%  │████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│   2,100,000,000 BABTC
```

### NO HAY PREMINE

**Distribucion via Mining (estilo eCash):**

Cada vez que un usuario mina y gana tokens, la distribucion se hace automaticamente:

```
Por cada 100 BABTC minados:
  ├── 70 BABTC → Minero (usuario que hizo PoUW)
  ├── 20 BABTC → Dev Fund (address hardcodeada)
  └── 10 BABTC → Staking Pool (rewards para stakers)
```

**Sin allocation inicial.** La primera transaccion del token ES el primer mint via mining.

```rust
// App Logic en Charms (pseudocodigo)
fn verify_mint(spell: &Spell) -> Result<()> {
    let total_minted = spell.total_amount();

    // Verificar distribucion obligatoria
    let miner_share = total_minted * 70 / 100;
    let dev_share = total_minted * 20 / 100;
    let staking_share = total_minted * 10 / 100;

    assert!(spell.output_to(MINER_ADDRESS) >= miner_share);
    assert!(spell.output_to(DEV_ADDRESS) >= dev_share);
    assert!(spell.output_to(STAKING_POOL) >= staking_share);

    Ok(())
}
```

## Halving Sincronizado con Bitcoin

### Schedule de Emision

El halving de $BABTC esta **sincronizado exactamente** con Bitcoin (cada 210,000 bloques):

```
Epoch 0 (Bloques 0 - 209,999):        500 BABTC/bloque
Epoch 1 (Bloques 210,000 - 419,999):  250 BABTC/bloque
Epoch 2 (Bloques 420,000 - 629,999):  125 BABTC/bloque
Epoch 3 (Bloques 630,000 - 839,999):  62.5 BABTC/bloque
Epoch 4 (Bloques 840,000+):           31.25 BABTC/bloque  ← ACTUAL
...continua hasta agotar supply
```

### Implementacion On-Chain

```rust
// Calcular reward basado en altura de bloque Bitcoin
fn calculate_block_reward(block_height: u64) -> u64 {
    let btc_epoch = block_height / 210_000;
    let initial_reward = 500_00000000u64; // 500 BABTC en unidades base

    // Halving: dividir por 2 cada epoch
    initial_reward >> btc_epoch
}
```

### Por que sincronizar con Bitcoin

1. **Narrativa poderosa:** "Sigue el ritmo de Bitcoin"
2. **Calculo determinista:** Cualquiera puede verificar
3. **Eventos de mercado:** Halvings de BTC generan atencion
4. **Simplicidad:** No inventar un nuevo schedule

## Lo INMUTABLE vs MUTABLE

### Inmutable (fijado en creacion)

| Parametro | Valor | Razon |
|-----------|-------|-------|
| `supply_limit` | 21B BABTC | Escasez garantizada |
| `decimals` | 8 | Compatibilidad BTC |
| `ticker` | BABTC | Identidad del token |
| Halving schedule | Sync con BTC | Formula en codigo |
| Distribucion % | 70/20/10 | Hardcodeado en App Logic |
| Dev address | `bc1q...` | En el codigo |

### Mutable (solo el contador)

| Parametro | Como cambia |
|-----------|-------------|
| `remaining_supply` | Decrece con cada mint |
| Balances de usuarios | Transferencias normales |

**NADA MAS es mutable.** Las reglas son ley.

## Arquitectura Modular

> Dos Charms Apps independientes que interactuan

### Por que Separado (No Integrado)

| Ventaja | Descripcion |
|---------|-------------|
| **Escalable** | Cada componente evoluciona independiente |
| **Menos riesgo** | Bug en NFT no afecta tokens |
| **Lanzamiento gradual** | Token primero, NFTs despues |
| **Upgradeable** | Puedes mejorar logica de NFT sin tocar token |
| **Mercados independientes** | Precios no correlacionados |

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    BITCOINBABY ECOSYSTEM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐      ┌─────────────────────┐      │
│  │   $BABTC TOKEN      │      │   GENESIS BABIES    │      │
│  │   (Charms App #1)   │      │   (Charms App #2)   │      │
│  │                     │      │                     │      │
│  │  • Fungible         │      │  • Non-fungible     │      │
│  │  • 21B supply       │      │  • 10,000 supply    │      │
│  │  • PoUW mining      │      │  • Traits + Rarity  │      │
│  │  • 70/20/10 split   │      │  • Evolution system │      │
│  │                     │      │                     │      │
│  └──────────┬──────────┘      └──────────┬──────────┘      │
│             │                            │                  │
│             │    ┌──────────────────┐    │                  │
│             └───►│  SCROLLS INDEX   │◄───┘                  │
│                  │  (Query Layer)   │                       │
│                  └────────┬─────────┘                       │
│                           │                                 │
│                  ┌────────▼─────────┐                       │
│                  │   BOOST LOGIC    │                       │
│                  │                  │                       │
│                  │  NFT ownership   │                       │
│                  │  ───────────►    │                       │
│                  │  Mining boost %  │                       │
│                  └──────────────────┘                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Timeline de Lanzamiento

```
Fase 1: $BABTC Token
├── Deploy token en testnet4
├── Testing de mining PoUW
├── Audit de App Logic
└── Launch en mainnet

Fase 2: Genesis Babies NFT
├── Generacion de 10,000 babies con AI
├── Deploy NFT contract
├── Whitelist + Public mint
└── Marketplace integration

Fase 3: Integracion Boost
├── Conectar token con NFT via Scrolls
├── Activar mining boosts
└── Testing end-to-end

Fase 4: Evolution System
├── Burn BABTC → Evolve NFT
├── Visual upgrades
└── Tier system completo
```

### Comunicacion Entre Apps

```rust
// En $BABTC Token App Logic
fn calculate_mining_reward(miner: Address, base_reward: u64) -> u64 {
    // Query Scrolls para verificar NFT ownership
    let boost = query_nft_boost(miner);

    // Aplicar boost (0-100%)
    base_reward * (100 + boost) / 100
}

fn query_nft_boost(owner: Address) -> u8 {
    // Scrolls API query al Genesis Babies contract
    let nfts = scrolls::query(
        app_id: GENESIS_BABIES_APP_ID,
        filter: { owner: owner }
    );

    if nfts.is_empty() { return 0; }

    // Retornar el mejor boost
    nfts.iter()
        .map(|nft| nft.state.boost_percentage)
        .max()
        .unwrap_or(0)
}
```

```typescript
// En frontend (packages/core)
export async function getMiningBoost(address: string): Promise<number> {
  const nfts = await scrollsClient.query({
    appId: GENESIS_BABIES_APP_ID,
    owner: address,
  });

  if (nfts.length === 0) return 0;

  // Mejor boost del usuario
  return Math.max(...nfts.map(nft => nft.boostPercentage));
}
```

---

## NFT Collection: Genesis Babies

> Coleccion separada del token, estilo CryptoPunks pero evolucionado

### Concepto

Los NFTs **NO** son el token $BABTC. Son una coleccion separada que da **utilidad** en el ecosistema:

```
$BABTC Token (fungible) ←→ Genesis Baby NFT (coleccionable)
         ↑                           ↑
    Se mina con PoUW           Se compra/tradea
    Recompensa por trabajo     Da boost al mining
```

### Especificaciones

| Aspecto | Valor |
|---------|-------|
| Supply | 10,000 Genesis Babies |
| Blockchain | Bitcoin (Charms NFT) |
| Generacion | Algoritmica + AI enhanced |
| Rareza | Basada en traits |

### Sistema de Generacion (Mejor que CryptoPunks)

**CryptoPunks:** 87 atributos, seleccion random, sin evolucion.

**Genesis Babies:** Sistema mejorado con AI:

```
Capas de Generacion:
├── Base Type (5 tipos)
│   ├── Human Baby (70%)
│   ├── Alien Baby (1%)
│   ├── Robot Baby (5%)
│   ├── Animal Baby (15%)
│   └── Mystic Baby (9%)
│
├── Traits Algoritmicos (150+ atributos)
│   ├── Eyes (20 variantes)
│   ├── Mouth (15 variantes)
│   ├── Hair/Head (30 variantes)
│   ├── Accessories (40 variantes)
│   ├── Background (25 variantes)
│   └── Special Effects (20 variantes)
│
├── AI Enhancement Layer
│   ├── Coherencia de estilo
│   ├── Paleta de colores harmonizada
│   └── Detalles unicos por combinacion
│
└── Rarity Score
    └── Calculado on-chain
```

### Evolucion (Inspirado en CryptoKitties, Mejorado)

A diferencia de CryptoPunks (estaticos), los Genesis Babies pueden **evolucionar**:

```
Genesis Baby (Lvl 1)
       │
       ▼ (Mining XP + BABTC burn)
   Evolved Baby (Lvl 2)
       │
       ▼ (Mas XP + burn)
   Advanced Baby (Lvl 3)
       │
       ▼
   Legendary Baby (Lvl 4)
       │
       ▼
   Mythic Baby (Final Form)
```

**Diferencia clave vs CryptoKitties:**
- No hay breeding (supply fijo de 10,000)
- Evolucion requiere mining real (PoUW)
- No hay gas fees explosivos (Charms en Bitcoin L1)
- Traits evolucionan visualmente

### Utilidad de los NFTs

Los Genesis Babies NO son solo coleccionables. Dan beneficios reales:

| Beneficio | Descripcion |
|-----------|-------------|
| Mining Boost | +10% a +50% segun rareza |
| XP Multiplier | Gana XP mas rapido |
| Acceso Anticipado | Features nuevas primero |
| Governance | Votar en decisiones |
| Airdrops | Tokens futuros del ecosistema |

**Ejemplo de Boost por Rareza:**

```
Common Baby (floor):     +10% mining rewards
Uncommon Baby:           +15% mining rewards
Rare Baby:               +25% mining rewards
Epic Baby:               +35% mining rewards
Legendary Baby:          +50% mining rewards
Mythic Baby (1 of 1):    +100% mining rewards
```

### Tecnicas de Generacion con AI

Inspirado en Art Blocks + moderno AI:

```python
# Pseudocodigo del generador
def generate_baby(seed: int) -> BabyNFT:
    # 1. Seleccion deterministica de traits
    rng = SeededRandom(seed)
    base_type = select_type(rng, TYPE_WEIGHTS)
    traits = select_traits(rng, base_type)

    # 2. Composicion de capas (estilo CryptoPunks)
    base_image = compose_layers(traits)

    # 3. AI Enhancement (nuevo)
    enhanced = ai_enhance(
        base_image,
        style="pixel_art_8bit",
        coherence=True,
        unique_details=True
    )

    # 4. Calcular rareza on-chain
    rarity_score = calculate_rarity(traits)

    return BabyNFT(
        image=enhanced,
        traits=traits,
        rarity=rarity_score,
        seed=seed  # Reproducible
    )
```

### Diferencias vs Proyectos Existentes

| Aspecto | CryptoPunks | CryptoKitties | Genesis Babies |
|---------|-------------|---------------|----------------|
| Supply | 10,000 | Infinito | 10,000 |
| Evolucion | No | Breeding | Evolucion lineal |
| Utilidad | Ninguna | Breeding | Mining boost |
| Chain | Ethereum | Ethereum | Bitcoin |
| AI | No | No | Si |
| Interactividad | Estatico | Breeding game | Mining game |

## Modelo de Ingresos

### 1. Venta de Genesis NFTs

```
10,000 NFTs
├── Whitelist (2,000): 0.0005 BTC = 1 BTC total
├── Public (8,000): 0.001 BTC = 8 BTC total
└── Total: ~9 BTC (~$900,000 USD)
```

### 2. Fee Capture (Estilo BRO)

Cada transaccion de mining incluye un fee en BTC:

```typescript
const MINING_TX_STRUCTURE = {
  // Input: UTXO del usuario
  inputs: [userUtxo],

  // Outputs
  outputs: [
    // 1. Charm spell (tokens BABTC)
    { type: 'charm', tokens: minedAmount },

    // 2. Fee capture para el proyecto
    { type: 'btc', to: PROJECT_ADDRESS, amount: 546 }, // dust limit

    // 3. Change al usuario
    { type: 'btc', to: userAddress, amount: change },
  ],

  // Fee a miners de Bitcoin
  fee: networkFee
};
```

**Proyeccion mensual (10,000 usuarios activos):**

```
10,000 usuarios x 5 submits/dia x 546 sats = 27.3M sats/dia
27.3M x 30 dias = 819M sats/mes = 8.19 BTC/mes
8.19 BTC x $100,000 = ~$819,000/mes
```

### 3. Marketplace Fees

```
Venta de NFT: 2.5% fee
├── 50% quemado (deflationary)
├── 30% treasury
└── 20% stakers
```

### 4. NO Subscriptions

**ELIMINADO.** No hay planes premium, suscripciones, ni pagos recurrentes. Los NFTs dan los boosts.

## Mecanismos de Quema

### 1. Evolution Burns

| Evolucion | BABTC Quemados |
|-----------|----------------|
| Lvl 1 → Lvl 2 | 1,000 BABTC |
| Lvl 2 → Lvl 3 | 5,000 BABTC |
| Lvl 3 → Lvl 4 | 25,000 BABTC |
| Lvl 4 → Final | 100,000 BABTC |

### 2. Marketplace Burns

- 50% de fees del marketplace se queman

### 3. Cosmetic Burns

- Nombres custom: 100 BABTC (quemados)
- Efectos especiales: 500 BABTC (quemados)

## Implementacion Tecnica

### Token ($BABTC)

```bash
# 1. Crear el Charms app
charms app new babtc-token

# 2. Implementar App Logic (Rust)
# Ver: packages/bitcoin/src/charms/babtc-token/

# 3. Compilar y obtener VK
charms app build
export APP_VK=$(charms app vk)

# 4. Deploy en testnet primero
charms deploy --network testnet4
```

### NFT Collection (Genesis Babies)

```bash
# Coleccion separada
charms app new genesis-babies

# Con logica de evolucion
# Ver: packages/bitcoin/src/charms/genesis-babies/
```

## Resumen de Decisiones

```yaml
Token:
  ticker: BABTC
  supply: 21,000,000,000 (21B)
  decimals: 8
  premine: none

Distribution:
  mining: 70%
  dev: 20%
  staking: 10%
  method: per-mint (estilo eCash)

Halving:
  sync: Bitcoin (cada 210,000 bloques)
  initial: 500 BABTC/bloque

NFT:
  name: Genesis Babies
  supply: 10,000
  utility: mining boost
  evolution: yes

Revenue:
  nft_sale: ~$900K
  fee_capture: ~$800K/mes (at scale)
  marketplace: 2.5%
  subscriptions: NONE
```

## Referencias

- [Charms Protocol](https://docs.charms.dev)
- [CryptoPunks Guide 2024](https://thenftbuzz.com/2024/10/20/a-complete-guide-to-cryptopunks-in-2024/)
- [CryptoKitties Genetics](https://guide.cryptokitties.co/guide/cat-features/genes)
- [eCash Tokenomics](https://www.ecash.org)
- [Bitcoin Halving](https://learnmeabitcoin.com/technical/mining/block-reward/)
