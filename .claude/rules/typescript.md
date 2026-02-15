---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Reglas TypeScript

## Configuracion Estricta
- `strict: true` siempre habilitado
- No usar `any` - usar `unknown` y type guards
- Preferir `interface` sobre `type` para objetos
- Usar `readonly` para datos inmutables

## Imports
```typescript
// Correcto: imports organizados
import { useState, useEffect } from 'react';
import { create } from 'zustand';

import { Button } from '@bitcoinbaby/ui';
import { useBabyStore } from '@bitcoinbaby/core';

import { localHelper } from './helpers';
import type { LocalType } from './types';

// Incorrecto: imports desordenados
import { localHelper } from './helpers';
import { useState } from 'react';
```

## Tipos
```typescript
// Correcto: interfaces bien definidas
interface MiningConfig {
  readonly difficulty: number;
  maxHashrate: number;
  onProgress?: (stats: MiningStats) => void;
}

// Incorrecto: tipos vagos
interface MiningConfig {
  options: any;
  callback: Function;
}
```

## Null Safety
```typescript
// Correcto: manejar null/undefined
function getUser(id: string): User | null {
  const user = users.get(id);
  return user ?? null;
}

// Usar optional chaining
const name = user?.profile?.name ?? 'Anonymous';

// Incorrecto: ignorar null
function getUser(id: string): User {
  return users.get(id)!; // Peligroso
}
```
