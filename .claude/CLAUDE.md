# BitcoinBaby - Contexto del Proyecto

> **Filosofia de desarrollo:** Codigo modular, escalable y con decisiones profesionales.
> **Estilo visual:** Pixel Art 8-bit inspirado en NES/SNES

BitcoinBaby es un ecosistema de mineria gamificado sobre Bitcoin usando Proof of Useful Work (PoUW). Los usuarios "crian" un bebe digital realizando tareas de IA que contribuyen a entrenar un modelo colectivo.

## Estilo Visual: Pixel Art 8-bit

**IMPORTANTE:** Todo el proyecto tiene estetica Pixel Art retro.

```css
/* Fuentes */
--font-pixel: 'Press Start 2P';      /* Titulos */
--font-pixel-body: 'Pixelify Sans';  /* Cuerpo */

/* Colores principales */
--pixel-primary: #f7931a;   /* Bitcoin Gold */
--pixel-secondary: #4fc3f7; /* Baby Blue */
--pixel-bg-dark: #0f0f1b;   /* Fondo oscuro */
```

Ver guia completa: @docs/PIXEL_ART_DESIGN.md

## Stack Tecnologico

| Capa | Tecnologia |
|------|------------|
| Monorepo | Turborepo + pnpm |
| Web | Next.js 15, React 19, Tailwind, shadcn/ui |
| Mobile | Next.js Static + Capacitor |
| State | Zustand |
| Mining | Web Workers + WebGPU |
| Blockchain | BitcoinOS, Charms, bitcoinjs-lib |
| AI | Transformers.js |

## Estructura del Monorepo

```
bitcoinbaby/
├── apps/
│   ├── web/           # Next.js 15 SSR (Vercel)
│   └── native/        # Next.js Static + Capacitor
└── packages/
    ├── ui/            # Componentes React compartidos
    ├── core/          # Logica de negocio + Zustand
    ├── bitcoin/       # bitcoinjs-lib + Charms SDK
    ├── ai/            # Transformers.js wrapper
    └── config/        # ESLint, Tailwind, TypeScript
```

## Comandos Esenciales

```bash
# Desarrollo
pnpm dev                    # Corre todo en paralelo
pnpm dev --filter web       # Solo apps/web
pnpm build                  # Build todo
pnpm typecheck              # Verificar tipos

# Agregar dependencias
pnpm add <pkg> --filter @bitcoinbaby/core
pnpm add @bitcoinbaby/ui --filter @bitcoinbaby/web --workspace

# Testing
pnpm test                   # Tests de todo
pnpm test --filter web      # Tests de web
```

## Reglas de Codigo

- TypeScript strict mode siempre
- ES modules (import/export), no CommonJS
- 2 espacios de indentacion
- Prettier para formateo automatico
- Componentes funcionales de React
- Server Components por defecto, Client Components con 'use client'

## Arquitectura de Mining

El motor de mineria sigue el patron del BRO token:
- `packages/core/src/mining/orchestrator.ts` - Orquestador principal
- `packages/core/src/mining/cpu-miner.ts` - Mineria CPU
- `packages/core/src/mining/webgpu-miner.ts` - Mineria WebGPU
- Web Workers para no bloquear UI

## Testing

- Jest para unit tests
- Playwright para E2E
- Tests colocados junto al codigo (`*.test.ts`)
- Coverage minimo: 80% en paths criticos

## Git Workflow

- Branches: `feature/`, `fix/`, `docs/`
- Commits: `type(scope): description`
- PRs requieren CI verde
- NUNCA commits de .env o secretos

## Referencias

- @ARCHITECTURE.md - Arquitectura detallada
- @ROADMAP.md - Fases de desarrollo
- @SETUP.md - Instrucciones de setup
- @docs/TECH_COMPARISON.md - Decisiones tecnologicas
- @docs/PIXEL_ART_DESIGN.md - Guia de diseno pixel art
- @docs/CLAUDE_CONFIG.md - Configuracion de Claude Code
