---
paths:
  - "**/*"
---

# Reglas de Instalacion

## REGLA PRINCIPAL

**SIEMPRE usar instaladores oficiales cuando esten disponibles.**

No crear archivos manualmente si existe un CLI o comando oficial para hacerlo.

## Ejemplos

### Next.js
```bash
# CORRECTO: Usar create-next-app
pnpm create next-app@latest apps/web --typescript --tailwind --eslint --app --src-dir

# INCORRECTO: Crear package.json y archivos manualmente
```

### shadcn/ui
```bash
# CORRECTO: Usar CLI oficial
pnpm dlx shadcn@latest init

# INCORRECTO: Copiar archivos de componentes manualmente
```

### Capacitor
```bash
# CORRECTO: Usar CLI de Capacitor
npx cap init
npx cap add ios
npx cap add android

# INCORRECTO: Crear capacitor.config.ts manualmente
```

### Dependencias
```bash
# CORRECTO: Instalar desde npm/pnpm
pnpm add zustand
pnpm add @bitcoinbaby/ui --workspace

# INCORRECTO: Editar package.json manualmente y correr install
```

## Por que es importante

1. **Actualizaciones**: Los instaladores oficiales usan las versiones mas recientes
2. **Compatibilidad**: Garantizan configuraciones correctas
3. **Mejores practicas**: Incluyen configuraciones recomendadas
4. **Menos errores**: Evitan typos y configuraciones incorrectas

## Antes de crear archivos

Preguntarse:
- ¿Existe un CLI oficial para esto?
- ¿Hay un comando `create-*` o `init`?
- ¿El framework tiene un instalador?

Si la respuesta es SI, usar el instalador oficial.
