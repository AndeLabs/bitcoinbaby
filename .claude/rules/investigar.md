---
paths:
  - "**/*"
---

# Regla: Investigar Antes de Codificar

## REGLA PRINCIPAL

**SIEMPRE investigar y verificar el contexto antes de escribir codigo.**

## Proceso Obligatorio

### 1. Antes de implementar algo nuevo

```
1. Buscar si ya existe en el proyecto
2. Revisar como se hace en otras partes del codigo
3. Buscar documentacion actualizada de la tecnologia
4. Verificar versiones y breaking changes
```

### 2. Antes de modificar codigo existente

```
1. Leer TODO el archivo/funcion antes de editar
2. Buscar todos los lugares donde se usa (grep, references)
3. Entender el contexto y por que esta escrito asi
4. Verificar tests existentes
```

### 3. Antes de agregar dependencias

```
1. Buscar si ya existe una dependencia similar en el proyecto
2. Verificar la version mas reciente
3. Revisar el changelog por breaking changes
4. Verificar compatibilidad con otras dependencias
```

## Herramientas a Usar

| Situacion | Herramienta |
|-----------|-------------|
| Buscar archivos | `Glob("**/patron*")` |
| Buscar codigo | `Grep("patron")` |
| Ver estructura | `Task(Explore, "investigar...")` |
| Info actualizada | `WebSearch("tecnologia version")` |
| Documentacion | `WebFetch(url_documentacion)` |

## Preguntas Antes de Codificar

1. ¿Ya existe algo similar en el proyecto?
2. ¿Estoy usando la version correcta de la API?
3. ¿Hay patrones establecidos que debo seguir?
4. ¿Donde esta la documentacion oficial?
5. ¿Ha habido cambios recientes en la tecnologia?

## Ejemplos

### CORRECTO
```
1. Usuario pide: "Agrega autenticacion"
2. Yo: Busco "auth" en el proyecto -> Encuentro patron existente
3. Yo: Busco Next.js Auth 2025 -> Verifico API actual
4. Yo: Implemento siguiendo patron del proyecto
```

### INCORRECTO
```
1. Usuario pide: "Agrega autenticacion"
2. Yo: Escribo codigo de memoria sin verificar
   - Puede usar API deprecada
   - Puede duplicar funcionalidad
   - Puede romper patrones existentes
```

## Cuando Investigar es OBLIGATORIO

- Nueva funcionalidad
- Integracion con servicios externos
- Modificacion de arquitectura
- Uso de APIs que cambian frecuentemente
- Dependencias nuevas
