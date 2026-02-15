---
paths:
  - "**/*.tsx"
  - "packages/ui/**/*"
  - "apps/web/src/**/*"
---

# Reglas React

## Componentes
```typescript
// Correcto: componente funcional con tipos
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onClick }: ButtonProps) {
  return (
    <button className={cn(variants[variant], sizes[size])} onClick={onClick}>
      {children}
    </button>
  );
}

// Incorrecto: props sin tipos
export function Button(props) {
  return <button {...props} />;
}
```

## Server vs Client Components
```typescript
// Server Component (default en Next.js App Router)
// No necesita 'use client'
async function UserList() {
  const users = await fetchUsers(); // Puede hacer fetch directo
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Client Component (necesita interactividad)
'use client';
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Hooks
```typescript
// Correcto: hooks personalizados para logica compleja
function useMiningStats() {
  const [stats, setStats] = useState<MiningStats | null>(null);

  useEffect(() => {
    const unsubscribe = miningService.subscribe(setStats);
    return unsubscribe;
  }, []);

  return stats;
}

// Usar en componente
function MiningDashboard() {
  const stats = useMiningStats();
  if (!stats) return <Loading />;
  return <StatsDisplay stats={stats} />;
}
```

## Performance
```typescript
// Memoizar componentes pesados
const HeavyChart = memo(function HeavyChart({ data }: Props) {
  return <Chart data={data} />;
});

// Memoizar calculos costosos
const sortedData = useMemo(() => {
  return data.sort((a, b) => b.value - a.value);
}, [data]);

// Callbacks estables
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```
