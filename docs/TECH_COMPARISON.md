# BitcoinBaby - Comparacion de Tecnologias 2025/2026

## Pregunta Central

> ¿Cual es la mejor arquitectura para web primero, con facil migracion a mobile?

**Respuesta: Next.js + Capacitor (Monorepo 2 Apps)**

---

## Contexto del Proyecto

BitcoinBaby es un ecosistema de mineria que:
- **Prioriza web** - Dashboard, onboarding, funcionalidad completa
- **Mobile es secundario** - Migracion futura cuando web este estable
- **Mineria en browser** - WebGPU/CPU mining (referencia: BRO token)
- **85%+ codigo compartido** - Entre web y mobile

---

## Analisis de Opciones

### Opcion 1: Next.js + Capacitor (Monorepo 2 Apps) - ELEGIDA

```
MONOREPO (Turborepo + pnpm)
├── apps/web          # Next.js 15 (SSR + API Routes)
├── apps/native       # Next.js 15 (Static Export) + Capacitor
└── packages/*        # 85% codigo compartido
```

**Ventajas:**
- Web tiene SSR completo, API Routes, SEO
- Mobile usa mismos componentes React
- Turborepo optimiza builds y cache
- Patron usado por empresas grandes (Vercel, etc.)
- Referencias: [nextjs-native-starter](https://github.com/RobSchilderr/nextjs-native-starter), [next-forge](https://github.com/vercel/next-forge)

**Desventajas:**
- Mobile corre en WebView (no 100% nativo)
- Requiere configurar Capacitor plugins para features nativos

**Ideal para:** Web-first con expansion a mobile

---

### Opcion 2: Expo (React Native + Web)

```
EXPO SDK 52+
├── iOS App (Nativo)
├── Android App (Nativo)
└── Web App (React DOM)
```

**Ventajas:**
- Una base de codigo para TODO
- Acceso directo a NPU (Neural Engine / Hexagon)
- React Native ExecuTorch para IA on-device
- expo-background-task para mineria en background

**Desventajas:**
- Web es ciudadano de segunda clase
- No hay SSR (solo CSR)
- SEO limitado
- Desarrollo web se siente "mobile-first"

**Ideal para:** Mobile-first con web secundario

---

### Opcion 3: Next.js + Backend Separado

```
apps/app     # Next.js SSR (web + static para mobile)
apps/api     # Express/Fastify backend
```

**Ventajas:**
- Arquitectura simple
- Backend escalable independiente

**Desventajas:**
- Duplicacion de logica entre frontend y backend
- Menos codigo compartido
- Mobile depende de API externa

**Ideal para:** Apps con backend pesado

---

### Opcion 4: Tauri 2.0

```
TAURI 2.0
├── Desktop (macOS, Windows, Linux)
├── iOS (Experimental)
├── Android (Experimental)
└── Web
```

**Ventajas:**
- Apps muy pequenas (3-10MB)
- Rust backend (bueno para crypto/ZK)
- Seguridad excelente

**Desventajas:**
- Mobile todavia experimental
- iOS builds "painful" segun desarrolladores
- Comunidad mas pequena

**Ideal para:** Desktop-first apps

---

## Matriz de Decision

| Requisito BitcoinBaby | Next.js+Capacitor | Expo | Tauri |
|-----------------------|-------------------|------|-------|
| Web-first | **SI** | No | Parcial |
| SSR + SEO | **SI** | No | No |
| Mining en browser | **SI** (WebGPU) | SI | SI |
| Background tasks (mobile) | Capacitor plugin | Nativo | Experimental |
| Codigo compartido 85%+ | **SI** | SI | SI |
| Produccion-ready | **SI** | SI | Parcial |
| Facil migracion web→mobile | **SI** | No aplica | Parcial |

---

## Decision Final: Next.js + Capacitor

### Por que esta arquitectura para BitcoinBaby

1. **Web es prioridad #1**
   - Landing page con SEO
   - Dashboard de mineria completo
   - Onboarding de usuarios

2. **Mobile viene despues**
   - Cuando web este estable
   - Capacitor permite reusar 85%+ del codigo
   - Plugins nativos para background mining

3. **Mining funciona en web**
   - WebGPU para aceleracion GPU
   - Web Workers para no bloquear UI
   - Referencia: [BRO token](https://github.com/CharmsDev/bro) usa esta arquitectura

4. **Patron profesional**
   - Usado por equipos de Vercel
   - Templates como next-forge
   - Turborepo para monorepo eficiente

---

## Arquitectura de Mining

### Web (apps/web)

```typescript
// packages/core/src/mining/orchestrator.ts
export class MiningOrchestrator {
  private cpuMiner: CPUMiner;
  private webgpuMiner: WebGPUMiner | null;

  async start() {
    // Detectar capacidades
    if (await this.hasWebGPU()) {
      this.webgpuMiner = new WebGPUMiner();
      await this.webgpuMiner.start();
    } else {
      this.cpuMiner = new CPUMiner();
      await this.cpuMiner.start();
    }
  }
}
```

### Mobile (apps/native)

```typescript
// Usa el mismo orchestrator de packages/core
// Pero puede agregar background mining via Capacitor

import { BackgroundTask } from '@capacitor/background-task';

BackgroundTask.beforeExit(async () => {
  // Mining continua en background
  await orchestrator.runBackgroundSession();
});
```

---

## Stack Tecnologico Final

| Capa | Tecnologia | Notas |
|------|------------|-------|
| **Monorepo** | Turborepo + pnpm | Cache inteligente, builds paralelos |
| **Web App** | Next.js 15 | SSR, App Router, API Routes |
| **Mobile App** | Next.js + Capacitor | Static export + WebView |
| **UI** | React 19 + Tailwind + shadcn/ui | Componentes compartidos |
| **State** | Zustand | Ligero, TypeScript-first |
| **Mining** | Web Workers + WebGPU | No bloquea UI |
| **Bitcoin** | bitcoinjs-lib + Charms SDK | Transacciones y tokens |
| **AI** | Transformers.js | Inferencia en browser |
| **Deploy Web** | Vercel | Edge functions, analytics |
| **Deploy Mobile** | App Store + Play Store | Via Capacitor |

---

## Referencias

- [Next.js Documentation](https://nextjs.org/docs)
- [Capacitor + Next.js](https://capacitorjs.com/docs)
- [nextjs-native-starter](https://github.com/RobSchilderr/nextjs-native-starter)
- [next-forge](https://github.com/vercel/next-forge)
- [Turborepo + Next.js](https://turborepo.dev/docs/guides/frameworks/nextjs)
- [BRO Token (Mining Reference)](https://github.com/CharmsDev/bro)
