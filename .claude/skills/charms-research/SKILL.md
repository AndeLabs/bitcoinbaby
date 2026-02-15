---
name: charms-research
description: Investiga el protocolo Charms para tokens en Bitcoin. Usa para entender Spells, Runes, y BitcoinOS.
allowed-tools: Read, Grep, Glob, WebFetch, WebSearch
---

# Investigacion de Charms Protocol

Investiga el protocolo Charms para crear tokens BABY sobre Bitcoin.

## Referencias

- Charms Protocol: https://charms.dev/
- BitcoinOS: https://www.bitcoinos.build/
- Runes Protocol: Nativo de Bitcoin

## Conceptos Clave

1. **Spells**: Scripts YAML que definen operaciones de tokens
2. **Runes**: Standard de tokens usando OP_RETURN
3. **BitSNARK**: Verificacion ZK off-chain
4. **Grail Bridge**: Bridge 1-of-N para assets

## Spell de Ejemplo (mine-baby.yaml)

```yaml
name: mine-baby
version: 1.0.0
operations:
  - type: mint
    token: BABY
    amount: calculated_from_work
    recipient: miner_address
```

## Integracion

1. Estudiar SDK de Charms
2. Crear spell para mining
3. Construir transacciones con OP_RETURN
4. Integrar con Scrolls API
5. Testing en Bitcoin testnet
