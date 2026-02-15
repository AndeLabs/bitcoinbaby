# BitcoinBaby - Setup del Monorepo

## Prerrequisitos

```bash
# Node.js 20+
node --version  # >= 20.0.0

# pnpm 9+
npm install -g pnpm
pnpm --version  # >= 9.0.0

# Git
git --version
```

---

## Paso 1: Inicializar Monorepo

```bash
cd /Users/munay/dev/bitcoinbaby

# Crear package.json root
pnpm init

# Crear pnpm-workspace.yaml
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
EOF
```

---

## Paso 2: Configurar Turborepo

```bash
# Instalar Turborepo
pnpm add -D turbo

# Crear turbo.json
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**", "out/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
EOF
```

---

## Paso 3: Crear Estructura de Directorios

```bash
# Crear estructura
mkdir -p apps/web
mkdir -p apps/native
mkdir -p packages/ui/src
mkdir -p packages/core/src
mkdir -p packages/bitcoin/src
mkdir -p packages/ai/src
mkdir -p packages/config/typescript
mkdir -p packages/config/eslint
mkdir -p packages/config/tailwind
mkdir -p docs
mkdir -p .github/workflows
```

---

## Paso 4: Crear .gitignore

```bash
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build
dist/
build/
.next/
out/

# Turbo
.turbo/

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Testing
coverage/

# Capacitor
apps/native/ios/App/Pods/
apps/native/android/.gradle/
apps/native/android/app/build/
*.apk
*.ipa
EOF
```

---

## Paso 5: Crear package.json Root

```bash
cat > package.json << 'EOF'
{
  "name": "bitcoinbaby",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.0.0"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
EOF
```

---

## Paso 6: Crear TypeScript Config Base

```bash
# packages/config/typescript/base.json
cat > packages/config/typescript/base.json << 'EOF'
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true
  }
}
EOF

# packages/config/package.json
cat > packages/config/package.json << 'EOF'
{
  "name": "@bitcoinbaby/config",
  "version": "0.0.1",
  "private": true,
  "exports": {
    "./typescript/base": "./typescript/base.json"
  }
}
EOF
```

---

## Paso 7: Crear apps/web (Next.js)

```bash
cd apps/web

# Crear Next.js app
pnpm create next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack

# Instalar shadcn/ui
pnpm dlx shadcn@latest init

# Volver al root
cd ../..
```

---

## Paso 8: Configurar apps/web para Monorepo

Editar `apps/web/package.json`:
```json
{
  "name": "@bitcoinbaby/web",
  "dependencies": {
    "@bitcoinbaby/ui": "workspace:*",
    "@bitcoinbaby/core": "workspace:*"
  }
}
```

Editar `apps/web/tsconfig.json`:
```json
{
  "extends": "@bitcoinbaby/config/typescript/base",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Paso 9: Crear packages/ui

```bash
# packages/ui/package.json
cat > packages/ui/package.json << 'EOF'
{
  "name": "@bitcoinbaby/ui",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./components/*": "./src/components/*.tsx"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0"
  }
}
EOF

# packages/ui/tsconfig.json
cat > packages/ui/tsconfig.json << 'EOF'
{
  "extends": "@bitcoinbaby/config/typescript/base",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# packages/ui/src/index.ts
cat > packages/ui/src/index.ts << 'EOF'
export * from './components';
EOF

# packages/ui/src/components/index.ts
mkdir -p packages/ui/src/components
cat > packages/ui/src/components/index.ts << 'EOF'
export { Button } from './button';
EOF

# packages/ui/src/components/button.tsx
cat > packages/ui/src/components/button.tsx << 'EOF'
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={clsx(buttonVariants({ variant, size }), className)} {...props} />
  );
}
EOF
```

---

## Paso 10: Crear packages/core

```bash
# packages/core/package.json
cat > packages/core/package.json << 'EOF'
{
  "name": "@bitcoinbaby/core",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.ts"
  },
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
EOF

# packages/core/tsconfig.json
cat > packages/core/tsconfig.json << 'EOF'
{
  "extends": "@bitcoinbaby/config/typescript/base",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

# packages/core/src/index.ts
cat > packages/core/src/index.ts << 'EOF'
export * from './stores';
export * from './types';
EOF

# packages/core/src/types.ts
cat > packages/core/src/types.ts << 'EOF'
export type BabyState = 'sleeping' | 'hungry' | 'happy' | 'learning' | 'evolving';

export interface Baby {
  id: string;
  name: string;
  state: BabyState;
  level: number;
  experience: number;
}

export interface MiningStats {
  hashrate: number;
  totalHashes: number;
  tokensEarned: number;
}
EOF

# packages/core/src/stores/index.ts
mkdir -p packages/core/src/stores
cat > packages/core/src/stores/index.ts << 'EOF'
export { useBabyStore } from './baby-store';
EOF

# packages/core/src/stores/baby-store.ts
cat > packages/core/src/stores/baby-store.ts << 'EOF'
import { create } from 'zustand';
import type { Baby, BabyState } from '../types';

interface BabyStore {
  baby: Baby | null;
  setBaby: (baby: Baby) => void;
  updateState: (state: BabyState) => void;
  addExperience: (xp: number) => void;
}

export const useBabyStore = create<BabyStore>((set) => ({
  baby: null,
  setBaby: (baby) => set({ baby }),
  updateState: (state) =>
    set((s) => (s.baby ? { baby: { ...s.baby, state } } : s)),
  addExperience: (xp) =>
    set((s) =>
      s.baby ? { baby: { ...s.baby, experience: s.baby.experience + xp } } : s
    ),
}));
EOF
```

---

## Paso 11: Instalar Dependencias

```bash
# Volver al root
cd /Users/munay/dev/bitcoinbaby

# Instalar todo
pnpm install
```

---

## Paso 12: Verificar Setup

```bash
# Verificar estructura
ls -la
ls -la apps/
ls -la packages/

# Correr dev
pnpm dev

# Verificar tipos
pnpm typecheck
```

---

## Paso 13: Inicializar Git

```bash
git init
git add .
git commit -m "chore: initialize monorepo with turborepo"
```

---

## Estructura Final

```
bitcoinbaby/
├── apps/
│   ├── web/          # Next.js 15 (SSR)
│   └── native/       # Next.js + Capacitor (futuro)
├── packages/
│   ├── ui/           # Componentes React
│   ├── core/         # Logica de negocio
│   ├── bitcoin/      # Bitcoin integration (futuro)
│   ├── ai/           # Transformers.js (futuro)
│   └── config/       # Configs compartidos
├── docs/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── .gitignore
```

---

## Comandos Utiles

```bash
# Desarrollo
pnpm dev              # Corre todo en paralelo
pnpm dev --filter web # Solo apps/web

# Build
pnpm build            # Build todo
pnpm build --filter web

# Agregar dependencia a un package
pnpm add zustand --filter @bitcoinbaby/core

# Agregar dependencia workspace
pnpm add @bitcoinbaby/ui --filter @bitcoinbaby/web --workspace
```

---

## Siguiente Paso

Ver [ROADMAP.md](./ROADMAP.md) - FASE 1: Web App Base
