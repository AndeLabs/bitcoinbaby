# BitcoinBaby - Decisiones Tecnicas

Este documento explica el "por que" detras de cada decision arquitectonica.

---

## 1. Por Que Bitcoin + BitcoinOS (No Ethereum/Solana)

### El Problema
- Ethereum: Gas fees variables, MEV attacks, no hereda seguridad de BTC
- Solana: Centralizado, downtimes frecuentes
- Nuevas L1: Sin efecto de red, liquidez fragmentada

### La Solucion: Bitcoin via BitcoinOS
```
SEGURIDAD:     Bitcoin L1 (hash rate masivo)
ESCALABILIDAD: BitSNARK (ZK verification off-chain)
PROGRAMACION:  Charms (smart contracts en UTXO)
```

**Beneficio clave:** BitcoinBaby hereda la seguridad de $2T en BTC sin
necesidad de bridges inseguros (gracias a Grail Bridge 1-de-N).

---

## 2. Por Que Runes (No BRC-20)

| Aspecto | BRC-20 | Runes |
|---------|--------|-------|
| Storage | Witness data (bloat) | OP_RETURN (limpio) |
| Indexer | Requerido off-chain | UTXO nativo |
| Fees | Alto (2 txs) | Bajo (1 tx) |
| Light clients | Dificil | Facil via SPV |

**Decision:** Runes permite que un telefono verifique saldos
sin descargar toda la blockchain (SPV), critico para mobile.

---

## 3. Por Que React Native (No Flutter/Native)

### Alternativas Evaluadas

| Framework | Pros | Contras |
|-----------|------|---------|
| Native (Swift/Kotlin) | Performance maxima | 2 codebases, 2x costo |
| Flutter | UI consistente | Dart ecosystem pequeno, bridges limitados |
| React Native | 1 codebase, JS ecosystem | Bridge overhead |

### Decision: React Native + Rust Core

```
UI Layer (React Native)
    │
    ▼ JSI (zero-copy)
    │
Native Core (Rust via uniffi)
```

- **UI en React Native:** Desarrollo rapido, hot reload, ecosystem NPM
- **Logica critica en Rust:** Crypto, ZK proofs, memoria segura
- **Bridge JSI:** Comunicacion sincrona, sin JSON serialization overhead

---

## 4. Por Que NPU (No CPU/GPU)

### Consumo Energetico Comparado

```
Operacion: 1M multiplicaciones de matrices

CPU:  100% utilization → 5W → bateria muere en 2h
GPU:  80% utilization  → 3W → calor excesivo
NPU:  dedicated silicon → 0.5W → imperceptible
```

### Dispositivos Soportados

| Chip | NPU | TOPS | Disponible |
|------|-----|------|------------|
| Apple A14+ | Neural Engine | 11-35 | iPhone 12+ |
| Snapdragon 8 Gen 2+ | Hexagon | 15-45 | Android flagship |
| Google Tensor G2+ | TPU | 8-20 | Pixel 7+ |

**Requisito minimo:** iPhone 12 / Android con Snapdragon 865+

---

## 5. Por Que Flower (No Custom FL)

### Alternativas

| Framework | Madurez | Mobile Support | Comunidad |
|-----------|---------|----------------|-----------|
| TensorFlow Federated | Alta | Limitado | Grande |
| PySyft | Media | Experimental | Pequena |
| Flower | Alta | Excelente | Activa |
| Custom | - | - | - |

### Razon: Flower

1. **SDK Mobile nativo** (iOS/Android)
2. **Estrategias de agregacion** built-in (FedAvg, FedProx)
3. **Produccion-ready** (usado por empresas grandes)
4. **Open source** con licencia permisiva

**Filosofia:** No reinventar la rueda. Flower tiene 3+ anos de desarrollo.

---

## 6. Por Que EZKL (No Otros ZK)

### Comparacion de Frameworks ZKML

| Framework | Modelo Max | Prover Time | Mobile |
|-----------|------------|-------------|--------|
| circom | Pequeno | Minutos | No |
| halo2 | Medio | Segundos | Dificil |
| EZKL | Grande (1B) | Segundos | Si |
| zkLLM | LLM | Minutos | No |

### EZKL Features

```
Modelo ONNX → ezkl setup → Circuito ZK → Prueba verificable
```

- Soporta **modelos ONNX** (exportar desde PyTorch/TF)
- **Compilable a mobile** (Rust + WebAssembly)
- **Probado** en produccion

---

## 7. Estrategia de Background (iOS vs Android)

### iOS: Cooperar con el Sistema

```swift
// BGProcessingTask - iOS 13+
BGTaskScheduler.shared.register(
    forTaskWithIdentifier: "com.baby.train",
    using: nil
) { task in
    self.handleTraining(task: task as! BGProcessingTask)
}

// Requisitos para ejecutar:
// - Dispositivo cargando
// - Conectado a WiFi
// - Usuario no usando telefono
```

**Por que funciona:** Apple permite tareas de "maintenance" y "ML training"
cuando el dispositivo esta en condiciones optimas. No es un "hack".

### Android: WorkManager + Constraints

```kotlin
val constraints = Constraints.Builder()
    .setRequiresCharging(true)
    .setRequiresDeviceIdle(true)
    .setRequiredNetworkType(NetworkType.UNMETERED)
    .build()

val request = PeriodicWorkRequestBuilder<TrainingWorker>(
    repeatInterval = 1,
    repeatIntervalTimeUnit = TimeUnit.HOURS
).setConstraints(constraints).build()
```

**Clave:** User-Initiated Data Transfer (UIDT) en Android 14+ da
privilegios extra si el usuario inicia la accion explicitamente.

---

## 8. Modelo de Seguridad ZK

### Problema: Usuarios Maliciosos

Un usuario podria enviar gradientes falsos para ganar tokens sin entrenar.

### Solucion: Verificacion Probabilistica

```
100 usuarios envian gradientes
    │
    ▼
5 elegidos aleatoriamente deben generar ZK proof completa
    │
    ├── Si pasan: todos reciben tokens
    │
    └── Si fallan: slashing (pierden stake)
```

**Trade-off:**
- 95% de usuarios: proof ligera (checksum)
- 5% de usuarios: proof completa (ZK)
- Costo computacional reducido 20x
- Seguridad mantenida via teoria de juegos

---

## 9. Tokenomics Rationale

### Suministro: 21B BABY

```
21,000,000,000 BABY = 21,000,000 BTC × 1000

Cada Satoshi de BTC = 1000 BABY (conceptualmente)
```

Esto permite:
- Numeros "amigables" para usuarios
- Precios tipo "$0.001 por BABY" en lugar de fracciones

### Emision: Halving Dinamico

```
recompensa = BASE_REWARD / (1 + log(total_mineros))
```

- Primeros usuarios: recompensas altas
- Mas usuarios: dificultad aumenta
- Similar a Bitcoin pero basado en participantes, no tiempo

### Deflacion: AI Utility

```
Empresas pagan por acceso al modelo global
    │
    ▼
Fondos usados para BUYBACK + BURN de BABY
    │
    ▼
Menor supply → mayor precio por token
```

---

## 10. Privacidad por Diseno

### Datos que NUNCA salen del telefono:

- Fotos
- Mensajes
- Historial de navegacion
- Cualquier dato personal

### Lo que SI sale:

```
Gradientes + Ruido Diferencial = Datos anonimos

matematicamente imposible reconstruir datos originales
```

**Implementacion:** Opacus (PyTorch) o TensorFlow Privacy

---

## Decision Tree para Desarrollo

```
¿Es logica critica de seguridad?
    │
    ├── SI → Escribir en Rust
    │
    └── NO → ¿Es UI?
                │
                ├── SI → React Native (TypeScript)
                │
                └── NO → ¿Es coordinacion FL?
                            │
                            ├── SI → Python (Flower)
                            │
                            └── NO → TypeScript (Node.js)
```

---

## Proximos Pasos Tecnicos

1. **Semana 1:** Setup monorepo, CI/CD basico
2. **Semana 2:** PoC de conexion a BitcoinOS testnet
3. **Semana 3:** PoC de Flower server + 1 cliente
4. **Semana 4:** PoC de EZKL en desktop

Ver [ROADMAP.md](../ROADMAP.md) para plan completo.
