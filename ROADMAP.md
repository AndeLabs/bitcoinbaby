# BitcoinBaby - Roadmap de Desarrollo

## Arquitectura Objetivo

```
┌─────────────────────────────────────────────────────────────┐
│                    MONOREPO (Turborepo)                      │
├─────────────────────────────────────────────────────────────┤
│  apps/web      │  apps/native   │  packages/*               │
│  (Next.js SSR) │  (Capacitor)   │  (85% codigo compartido)  │
└─────────────────────────────────────────────────────────────┘
```

---

## FASE 0: Monorepo Setup
**Objetivo:** Estructura base profesional lista

### Tareas
- [ ] Inicializar monorepo con pnpm workspaces
- [ ] Configurar Turborepo
- [ ] Crear estructura de directorios
- [ ] Setup TypeScript base
- [ ] Configurar ESLint + Prettier
- [ ] Setup Git + Husky hooks
- [ ] Crear packages/config

### Comandos
```bash
cd /Users/munay/dev/bitcoinbaby
pnpm init
# Seguir SETUP.md
```

### Entregable
- Monorepo funcional
- `pnpm dev` corre sin errores
- CI basico en GitHub Actions

---

## FASE 1: Web App Base (apps/web)
**Objetivo:** Next.js app funcionando

### Tareas
- [ ] Crear apps/web con Next.js 15
- [ ] Configurar App Router
- [ ] Instalar y configurar Tailwind
- [ ] Setup shadcn/ui
- [ ] Crear layout base
- [ ] Landing page inicial
- [ ] Deploy inicial en Vercel

### Estructura
```
apps/web/
├── app/
│   ├── (marketing)/
│   │   └── page.tsx      # Landing
│   └── layout.tsx
├── next.config.ts
└── package.json
```

### Entregable
- Web app en Vercel
- Landing page responsive
- Dark/light mode

---

## FASE 2: Packages Base
**Objetivo:** Codigo compartido listo

### Tareas
- [ ] Crear packages/ui
  - [ ] Configurar como libreria React
  - [ ] Exportar componentes base
  - [ ] Setup Tailwind compartido
- [ ] Crear packages/core
  - [ ] Estructura de stores (Zustand)
  - [ ] Types compartidos
- [ ] Crear packages/config
  - [ ] ESLint config compartido
  - [ ] Tailwind config compartido
  - [ ] TypeScript config compartido

### Estructura
```
packages/
├── ui/
│   └── src/components/
├── core/
│   └── src/stores/
└── config/
    ├── eslint/
    ├── tailwind/
    └── typescript/
```

### Entregable
- apps/web importa de packages/ui
- Componentes compartidos funcionando

---

## FASE 3: Wallet Integration (packages/bitcoin)
**Objetivo:** Funcionalidad Bitcoin basica

### Tareas
- [ ] Crear packages/bitcoin
- [ ] Integrar bitcoinjs-lib
- [ ] Generar wallet (keypair)
- [ ] Mostrar address
- [ ] Generar QR code
- [ ] Almacenamiento seguro de claves
- [ ] UI de wallet en apps/web

### Componentes
```typescript
// packages/bitcoin/src/wallet.ts
export function generateWallet(): Wallet
export function getAddress(wallet: Wallet): string
export function signTransaction(wallet: Wallet, tx: Transaction): SignedTx
```

### Entregable
- Usuario puede crear wallet
- Ver su address Bitcoin
- Exportar/importar wallet

---

## FASE 4: Mining Engine (packages/core)
**Objetivo:** Motor de mineria en browser

### Tareas
- [ ] Crear mining/orchestrator.ts
- [ ] Implementar cpu-miner.ts
- [ ] Implementar webgpu-miner.ts (si disponible)
- [ ] Detectar capacidades del dispositivo
- [ ] UI de mining dashboard
- [ ] Web Workers para no bloquear UI
- [ ] Prueba de trabajo (hash con leading zeros)

### Referencia
[github.com/CharmsDev/bro/tree/main/webapp/src/mining](https://github.com/CharmsDev/bro/tree/main/webapp/src/mining)

### Entregable
- Usuario puede "minar" en browser
- Hashrate display
- Toggle CPU/GPU

---

## FASE 5: Charms Integration (packages/bitcoin)
**Objetivo:** Conectar con protocolo Charms

### Tareas
- [ ] Estudiar Charms SDK y documentacion
- [ ] Integrar con packages/bitcoin
- [ ] Crear spell mine-baby.yaml
- [ ] Construir transacciones con OP_RETURN
- [ ] Integrar Scrolls API
- [ ] Test en Bitcoin testnet

### Entregable
- Transacciones de mining en testnet
- Tokens BABY acunados (testnet)

---

## FASE 6: Tamagotchi Game (packages/core + packages/ui)
**Objetivo:** Gamificacion del mining

### Tareas
- [ ] Disenar personaje Baby (pixel art)
- [ ] Crear baby-state.ts (estados del bebé)
- [ ] Sistema de niveles/evolucion
- [ ] Animaciones de estado
- [ ] Dashboard de estadisticas
- [ ] Conectar estado con mining

### Estados del Baby
```typescript
type BabyState = 'sleeping' | 'hungry' | 'happy' | 'learning' | 'evolving'
```

### Entregable
- UI gamificada funcionando
- Baby reacciona al mining

---

## FASE 7: AI Integration (packages/ai)
**Objetivo:** Prueba de Trabajo Util

### Tareas
- [ ] Crear packages/ai
- [ ] Integrar Transformers.js
- [ ] Cargar modelo quantizado (~50MB)
- [ ] Ejecutar inferencia en Web Worker
- [ ] Reemplazar hash mining con AI tasks
- [ ] UI de progreso de IA

### Entregable
- Mining basado en tareas de IA
- Proof of Useful Work funcionando

---

## FASE 8: Native App Setup (apps/native)
**Objetivo:** Capacitor app funcionando

### Tareas
- [ ] Crear apps/native (copia de web)
- [ ] Configurar next.config.ts con output: 'export'
- [ ] Instalar Capacitor
- [ ] Configurar capacitor.config.ts
- [ ] Setup iOS (Xcode)
- [ ] Setup Android (Android Studio)
- [ ] Conectar con APIs de apps/web

### Configuracion
```typescript
// apps/native/next.config.ts
export default {
  output: 'export',
  images: { unoptimized: true }
}
```

### Entregable
- App corriendo en simulador iOS/Android
- Misma funcionalidad que web

---

## FASE 9: Native Features
**Objetivo:** Features exclusivos de mobile

### Tareas
- [ ] Push notifications
- [ ] Background mining
- [ ] Haptic feedback
- [ ] Biometric auth
- [ ] Deep links

### Plugins Capacitor
```bash
npm install @capacitor/push-notifications
npm install @capacitor/local-notifications
npm install @capacitor/haptics
```

### Entregable
- Background mining funcionando
- Push notifications configuradas

---

## FASE 10: Mainnet Launch
**Objetivo:** Produccion

### Tareas
- [ ] Auditoria de seguridad
- [ ] Crear Rune BABY en mainnet
- [ ] Deploy spells finales
- [ ] Submit iOS App Store
- [ ] Submit Google Play Store
- [ ] Landing page final
- [ ] Documentacion para usuarios

### Entregable
- Web app en produccion
- Apps en tiendas
- Token BABY live

---

## Diagrama de Dependencias

```
FASE 0 (Monorepo)
    │
    ▼
FASE 1 (Web App) ──────────────────┐
    │                              │
    ▼                              │
FASE 2 (Packages) ◄────────────────┤
    │                              │
    ├──────┬──────┬──────┐         │
    ▼      ▼      ▼      ▼         │
  FASE 3  FASE 4  FASE 6  FASE 7   │
  Wallet  Mining  Game    AI       │
    │      │      │       │        │
    └──────┴──────┴───────┘        │
           │                       │
           ▼                       │
        FASE 5 (Charms) ◄──────────┘
           │
           ▼
        FASE 8 (Native Setup)
           │
           ▼
        FASE 9 (Native Features)
           │
           ▼
        FASE 10 (Mainnet)
```

---

## Prioridades por Sprint

### Sprint 1 (Setup)
- FASE 0: Monorepo
- FASE 1: Web app base
- FASE 2: Packages base

### Sprint 2 (Core Features)
- FASE 3: Wallet
- FASE 4: Mining engine

### Sprint 3 (Blockchain)
- FASE 5: Charms integration

### Sprint 4 (Polish)
- FASE 6: Tamagotchi game
- FASE 7: AI integration

### Sprint 5 (Mobile)
- FASE 8: Native setup
- FASE 9: Native features

### Sprint 6 (Launch)
- FASE 10: Mainnet

---

## Siguiente Paso

**Empezar FASE 0: Monorepo Setup**

```bash
cd /Users/munay/dev/bitcoinbaby
# Seguir instrucciones en SETUP.md
```
