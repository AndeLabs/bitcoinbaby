# BitcoinBaby - Arquitectura del Sistema

## Vision General

BitcoinBaby es un ecosistema de mineria basado en **Prueba de Trabajo Util (PoUW)**
sobre Bitcoin. Los usuarios "crian" una entidad digital realizando tareas de IA
que contribuyen a entrenar un modelo colectivo.

**Filosofia:** Web primero, movil despues. Modular, escalable, profesional.

---

## 1. Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BITCOINBABY MONOREPO                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   APPS (Desplegables independientes)                                        │
│   ┌─────────────────────────┐     ┌─────────────────────────┐               │
│   │       apps/web          │     │      apps/native        │               │
│   │                         │     │                         │               │
│   │  • Full Next.js 15      │     │  • Next.js Static       │               │
│   │  • SSR + API Routes     │     │  • Capacitor wrapper    │               │
│   │  • Vercel deployment    │     │  • iOS + Android        │               │
│   │  • SEO optimizado       │     │  • Plugins nativos      │               │
│   │                         │     │                         │               │
│   │  Puerto: 3000           │     │  Build: out/            │               │
│   └───────────┬─────────────┘     └───────────┬─────────────┘               │
│               │                               │                              │
│               └───────────────┬───────────────┘                              │
│                               │                                              │
│                               ▼                                              │
│   PACKAGES (Codigo compartido - 85%+)                                       │
│   ┌─────────────────────────────────────────────────────────────────┐       │
│   │                                                                  │       │
│   │   packages/ui          → Componentes React + shadcn/ui          │       │
│   │   packages/core        → Logica de negocio (mining, game, etc)  │       │
│   │   packages/bitcoin     → bitcoinjs-lib + Charms SDK             │       │
│   │   packages/ai          → Transformers.js wrapper                │       │
│   │   packages/config      → ESLint, Tailwind, TypeScript configs   │       │
│   │                                                                  │       │
│   └─────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnologico

### Apps

| App | Framework | Rendering | Deploy |
|-----|-----------|-----------|--------|
| `apps/web` | Next.js 15 + React 19 | SSR + SSG + ISR | Vercel |
| `apps/native` | Next.js 15 (static) | Static Export | Capacitor → App Stores |

### Packages

| Package | Proposito | Tecnologias |
|---------|-----------|-------------|
| `packages/ui` | Componentes UI | React, Tailwind, shadcn/ui |
| `packages/core` | Logica de negocio | TypeScript, Zustand |
| `packages/bitcoin` | Blockchain | bitcoinjs-lib, Charms SDK |
| `packages/ai` | IA en browser | Transformers.js, WebGPU |
| `packages/config` | Configuraciones | ESLint, Tailwind, TSConfig |

### Infraestructura

| Capa | Tecnologia |
|------|------------|
| Monorepo | Turborepo + pnpm |
| CI/CD | GitHub Actions |
| Deploy Web | Vercel |
| Deploy Mobile | App Store + Play Store |

---

## 3. Estructura de Directorios

```
bitcoinbaby/
├── README.md
├── ARCHITECTURE.md
├── ROADMAP.md
├── package.json                    # Root workspace
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
│
├── apps/
│   ├── web/                        # Full Next.js App
│   │   ├── app/                    # App Router
│   │   │   ├── (marketing)/        # Landing, about, etc.
│   │   │   │   ├── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   ├── (app)/              # App principal
│   │   │   │   ├── mine/
│   │   │   │   ├── baby/
│   │   │   │   ├── wallet/
│   │   │   │   └── layout.tsx
│   │   │   ├── api/                # API Routes
│   │   │   │   ├── mining/
│   │   │   │   ├── wallet/
│   │   │   │   └── health/
│   │   │   └── layout.tsx
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── native/                     # Capacitor App
│       ├── app/                    # Same structure as web
│       │   ├── (app)/
│       │   │   ├── mine/
│       │   │   ├── baby/
│       │   │   └── wallet/
│       │   └── layout.tsx
│       ├── capacitor.config.ts
│       ├── ios/                    # Xcode project
│       ├── android/                # Android Studio project
│       ├── next.config.ts          # output: 'export'
│       └── package.json
│
├── packages/
│   ├── ui/                         # Shared UI Components
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── baby-avatar.tsx
│   │   │   │   ├── mining-dashboard.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── core/                       # Business Logic
│   │   ├── src/
│   │   │   ├── mining/
│   │   │   │   ├── orchestrator.ts
│   │   │   │   ├── cpu-miner.ts
│   │   │   │   ├── webgpu-miner.ts
│   │   │   │   └── types.ts
│   │   │   ├── game/
│   │   │   │   ├── baby-state.ts
│   │   │   │   ├── evolution.ts
│   │   │   │   └── rewards.ts
│   │   │   ├── stores/
│   │   │   │   ├── mining-store.ts
│   │   │   │   ├── baby-store.ts
│   │   │   │   └── wallet-store.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── bitcoin/                    # Blockchain Integration
│   │   ├── src/
│   │   │   ├── wallet.ts
│   │   │   ├── transactions.ts
│   │   │   ├── charms.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ai/                         # AI/ML Integration
│   │   ├── src/
│   │   │   ├── transformers.ts
│   │   │   ├── webgpu-backend.ts
│   │   │   ├── models.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── config/                     # Shared Configs
│       ├── eslint/
│       │   └── index.js
│       ├── tailwind/
│       │   └── tailwind.config.ts
│       ├── typescript/
│       │   └── base.json
│       └── package.json
│
├── docs/
│   ├── DECISIONS.md                # Decisiones tecnicas
│   └── whitepaper/
│
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

---

## 4. Flujo de Datos

### Web App (apps/web)

```
Usuario → Next.js SSR → API Routes → Logica (packages/core)
                                          │
                                          ├── Mining Engine
                                          ├── Bitcoin/Charms
                                          └── AI (Transformers.js)
                                          │
                                          ▼
                                    Bitcoin Network
```

### Native App (apps/native)

```
Usuario → Capacitor WebView → Static Next.js
                                    │
                                    ├── Llama APIs de apps/web
                                    ├── Plugins nativos (background, etc.)
                                    └── Logica local (packages/core)
                                    │
                                    ▼
                              Bitcoin Network
```

---

## 5. Diferencias Web vs Native

| Feature | apps/web | apps/native |
|---------|----------|-------------|
| **Rendering** | SSR + SSG | Static Export |
| **API Routes** | ✅ Si | ❌ Llama a web |
| **SEO** | ✅ Completo | N/A |
| **Background Tasks** | ❌ Limitado | ✅ Nativo |
| **Push Notifications** | ✅ Web Push | ✅ Nativo |
| **Offline** | ✅ PWA | ✅ Capacitor |
| **App Stores** | ❌ No | ✅ Si |

---

## 6. Codigo Compartido (packages/)

### Porcentaje de Codigo Compartido: ~85%

```
┌────────────────────────────────────────────────────────────┐
│                    CODIGO TOTAL                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ████████████████████████████████████░░░░░░░  85%         │
│  │                                  │       │             │
│  │      packages/* (compartido)     │ apps/ │             │
│  │                                  │(unico)│             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Compartido (packages/):**
- Componentes UI
- Logica de mineria
- Estado (Zustand stores)
- Integracion Bitcoin
- Motor de IA

**Unico por app:**
- Routing/pages
- API Routes (solo web)
- Configuracion Capacitor (solo native)
- Plugins nativos (solo native)

---

## 7. Dependencias Clave

### Root (package.json)
```json
{
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

### apps/web
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "@bitcoinbaby/ui": "workspace:*",
    "@bitcoinbaby/core": "workspace:*",
    "@bitcoinbaby/bitcoin": "workspace:*",
    "@bitcoinbaby/ai": "workspace:*"
  }
}
```

### apps/native
```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/ios": "^6.0.0",
    "@capacitor/android": "^6.0.0",
    "@bitcoinbaby/ui": "workspace:*",
    "@bitcoinbaby/core": "workspace:*"
  }
}
```

### packages/ui
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0"
  },
  "peerDependencies": {
    "react": "^19.0.0"
  }
}
```

---

## 8. Referencias

- [nextjs-native-starter](https://github.com/RobSchilderr/nextjs-native-starter) - Arquitectura de referencia
- [next-forge](https://github.com/vercel/next-forge) - Template profesional Turborepo
- [Turborepo + Next.js](https://turborepo.dev/docs/guides/frameworks/nextjs) - Documentacion oficial
- [BRO Token (Charms)](https://github.com/CharmsDev/bro) - Referencia de mining
- [Capacitor + Next.js](https://capacitorjs.com/docs) - Integracion mobile
