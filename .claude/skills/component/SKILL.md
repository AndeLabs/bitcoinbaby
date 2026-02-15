---
name: component
description: Crea un nuevo componente React en packages/ui. Usa para UI compartida.
disable-model-invocation: true
argument-hint: "[ComponentName]"
allowed-tools: Read, Write, Edit
---

# Crear Componente UI

Crea un nuevo componente React en `packages/ui/src/components/`.

## Estructura del Componente

```typescript
// packages/ui/src/components/$ARGUMENTS.tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const $ARGUMENTSVariants = cva(
  'base-classes-here',
  {
    variants: {
      variant: {
        default: 'default-styles',
        // agregar variantes
      },
      size: {
        default: 'default-size',
        sm: 'small-size',
        lg: 'large-size',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface $ARGUMENTSProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof $ARGUMENTSVariants> {}

export function $ARGUMENTS({ className, variant, size, ...props }: $ARGUMENTSProps) {
  return (
    <div className={clsx($ARGUMENTSVariants({ variant, size }), className)} {...props} />
  );
}
```

## Checklist

1. Crear archivo del componente
2. Exportar desde `packages/ui/src/components/index.ts`
3. Agregar TypeScript types
4. Usar class-variance-authority para variantes
5. Documentar props con JSDoc si es necesario
