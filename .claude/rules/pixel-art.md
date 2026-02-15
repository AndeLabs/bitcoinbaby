---
paths:
  - "packages/ui/**/*"
  - "apps/web/src/**/*.tsx"
  - "apps/web/src/**/*.css"
  - "**/*.css"
---

# Reglas de Diseno Pixel Art 8-bit

## REGLA PRINCIPAL

**Todo el proyecto debe seguir el estilo visual Pixel Art 8-bit inspirado en NES/SNES.**

## Paleta de Colores (OBLIGATORIA)

Solo usar estos colores en la UI:

```css
/* Fondos */
#0f0f1b, #1a1a2e, #2d2d44

/* Primary (Bitcoin) */
#f7931a, #ffc107, #e67e00

/* Secondary (Baby Blue) */
#4fc3f7, #81d4fa, #29b6f6

/* Success/Error */
#4ade80, #22c55e, #ef4444, #dc2626

/* Text */
#ffffff, #9ca3af, #1f2937

/* Borders */
#374151, #000000
```

## Tipografia (OBLIGATORIA)

```css
/* Titulos y botones */
font-family: 'Press Start 2P', cursive;

/* Texto de cuerpo (legible) */
font-family: 'Pixelify Sans', sans-serif;

/* Numeros y stats */
font-family: 'VT323', monospace;
```

## Bordes Pixelados

```css
/* CORRECTO: Borde estilo NES */
border: 4px solid #374151;
box-shadow: 4px 4px 0 0 #000000;

/* INCORRECTO: Bordes redondeados suaves */
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0,0,0,0.1);
```

## Imagenes y Sprites

```css
/* SIEMPRE aplicar renderizado pixelado */
image-rendering: pixelated;
image-rendering: crisp-edges;

/* NUNCA usar anti-aliasing en sprites */
```

## Animaciones

```css
/* CORRECTO: Animaciones discretas con steps */
animation: walk 0.5s steps(4) infinite;

/* INCORRECTO: Animaciones suaves */
animation: walk 0.5s ease-in-out infinite;
```

## Tamanos de Sprites

```
8x8   - Iconos pequenos, particulas
16x16 - Iconos UI, items
32x32 - Avatar pequeno
64x64 - Avatar principal
128x128 - Detalle/evolucion
```

## Efectos Prohibidos

NO usar:
- Gradientes suaves
- Sombras difusas (blur)
- Bordes redondeados grandes
- Fuentes sans-serif normales
- Transiciones muy suaves

## Verificacion de Consistencia

Antes de crear/modificar UI, verificar:
1. ¿Los colores estan en la paleta?
2. ¿La tipografia es pixel?
3. ¿Los bordes son rectos/pixelados?
4. ¿Las animaciones usan steps()?
5. ¿Las imagenes tienen image-rendering: pixelated?

## Referencia

Ver documentacion completa: `docs/PIXEL_ART_DESIGN.md`
