---
name: mining-research
description: Investiga implementaciones de mining en browser. Usa para entender WebGPU, Web Workers, y patrones de mineria.
allowed-tools: Read, Grep, Glob, WebFetch, WebSearch
---

# Investigacion de Mining

Investiga patrones de mineria en browser para BitcoinBaby.

## Referencias Clave

- BRO Token: https://github.com/CharmsDev/bro
- WebGPU API: https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
- Web Workers: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API

## Patrones a Investigar

1. **Orchestrator Pattern**: Como coordinar CPU y GPU miners
2. **Web Workers**: No bloquear UI durante mining
3. **WebGPU**: Aceleracion GPU para hashing
4. **Proof of Work**: Algoritmos de hashing con leading zeros

## Codigo de Referencia

```
BRO Token estructura:
webapp/src/mining/
├── orchestrator.ts     # Coordinador principal
├── cpu-miner.ts        # Mining con CPU
├── webgpu-miner.ts     # Mining con GPU
└── types.ts            # Interfaces compartidas
```

Investiga estas implementaciones y adapta para BitcoinBaby.
