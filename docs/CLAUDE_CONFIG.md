# BitcoinBaby - Configuracion de Claude Code

Este documento explica como esta configurado Claude Code para desarrollo optimo del proyecto.

## Filosofia

> **"Codigo modular, escalable y con decisiones profesionales"**

Esta frase guia todas las interacciones con Claude en este proyecto.

---

## Estructura de Configuracion

```
.claude/
├── CLAUDE.md              # Contexto principal del proyecto
├── settings.json          # Permisos y hooks
├── skills/                # Skills personalizados
│   ├── dev/               # /dev - Iniciar desarrollo
│   ├── build/             # /build - Compilar proyecto
│   ├── mining-research/   # /mining-research - Investigar mining
│   ├── charms-research/   # /charms-research - Investigar Charms
│   └── component/         # /component - Crear componente UI
├── agents/                # Agentes especializados
│   ├── security-auditor.md    # Auditoria de seguridad
│   ├── code-reviewer.md       # Code review
│   ├── blockchain-expert.md   # Experto Bitcoin/Charms/Scrolls
│   ├── mining-expert.md       # Experto mining browser
│   └── ai-expert.md           # Experto Transformers.js
├── hooks/                 # Automatizaciones
│   ├── format-on-edit.sh  # Auto-format con Prettier
│   └── protect-env.sh     # Proteger archivos sensibles
└── rules/                 # Reglas por contexto
    ├── typescript.md      # Reglas TS generales
    ├── react.md           # Reglas React/Next.js
    └── blockchain.md      # Reglas packages/bitcoin
```

---

## Skills Disponibles

| Skill | Comando | Descripcion |
|-------|---------|-------------|
| dev | `/dev` | Iniciar servidor de desarrollo |
| build | `/build` | Compilar proyecto completo |
| mining-research | `/mining-research` | Investigar patrones de mining |
| charms-research | `/charms-research` | Investigar Charms/Scrolls |
| component | `/component Button` | Crear componente UI |

---

## Agentes Especializados

### Auto-Activacion

Los agentes se activan automaticamente cuando:

| Agente | Se activa cuando... |
|--------|---------------------|
| `blockchain-expert` | Trabajo en `packages/bitcoin/`, menciones de wallet/Charms/Scrolls |
| `mining-expert` | Trabajo en `packages/core/mining/`, menciones de hashrate/WebGPU |
| `ai-expert` | Trabajo en `packages/ai/`, menciones de Transformers.js/modelo |
| `security-auditor` | Antes de commits, cambios en auth/wallets/keys |
| `code-reviewer` | Despues de implementaciones, preparacion de PRs |

### Invocacion Manual

```
Usa el agente blockchain-expert para revisar la integracion con Scrolls
Usa el agente security-auditor para auditar el modulo de wallet
```

---

## Hooks Automaticos

### PostToolUse: Auto-Format
Despues de cada edicion, Prettier formatea automaticamente archivos TS/JS.

### PreToolUse: Proteccion
Bloquea ediciones a archivos sensibles:
- `.env*`
- `secrets/`
- `credentials/`

### SessionStart: Contexto
Al iniciar sesion, recuerda la filosofia del proyecto.

---

## Reglas por Contexto

Las reglas en `.claude/rules/` se cargan automaticamente segun el path:

| Regla | Se aplica a |
|-------|-------------|
| `typescript.md` | Todos los archivos `*.ts`, `*.tsx` |
| `react.md` | Componentes en `packages/ui/`, `apps/web/` |
| `blockchain.md` | Codigo en `packages/bitcoin/` |

---

## Permisos Configurados

### Permitidos
- Comandos pnpm, npm, npx, git, turbo
- Lectura/escritura de archivos
- Busqueda web para investigacion
- Agentes y tareas

### Bloqueados
- `rm -rf /` y comandos destructivos
- `sudo` (operaciones privilegiadas)
- Edicion de archivos `.env`

---

## Como Extender

### Agregar Nuevo Skill

1. Crear directorio: `.claude/skills/mi-skill/`
2. Crear `SKILL.md` con frontmatter YAML
3. Definir descripcion para auto-activacion

```markdown
---
name: mi-skill
description: Descripcion para cuando Claude deberia usarlo automaticamente
allowed-tools: Read, Write, Bash
---

# Instrucciones del skill...
```

### Agregar Nuevo Agente

1. Crear archivo: `.claude/agents/mi-agente.md`
2. Definir cuando se activa automaticamente
3. Incluir conocimiento especializado

```markdown
---
name: mi-agente
description: Descripcion con contextos de auto-activacion
tools: Read, Grep, Glob
model: sonnet
---

# Auto-Activacion
Este agente se activa cuando...

# Conocimiento especializado...
```

### Agregar Nueva Regla

1. Crear archivo: `.claude/rules/mi-regla.md`
2. Definir paths donde aplica
3. Documentar las reglas

```markdown
---
paths:
  - "packages/mi-package/**/*"
---

# Reglas para mi-package...
```

---

## Actualizaciones

Los agentes y skills deben actualizarse cuando:
- Se descubren nuevas versiones de tecnologias
- Se aprenden nuevos patrones del proyecto
- Cambia la arquitectura

Usa el comando `/memory` para ver notas automaticas que Claude guarda sobre el proyecto.

---

## Referencias

- [Claude Code Skills](https://code.claude.com/docs/en/skills.md)
- [Claude Code Hooks](https://code.claude.com/docs/en/hooks.md)
- [Claude Code Agents](https://code.claude.com/docs/en/sub-agents.md)
- [Best Practices](https://code.claude.com/docs/en/best-practices.md)
