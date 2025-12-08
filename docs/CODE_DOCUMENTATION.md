# 📚 Documentación de Código - Hooks y Utilidades Complejas

## 🎯 useActivityTracker Hook

**Ubicación:** `src/hooks/useActivityTracker.ts`

### ¿Qué hace?
Rastrea cuánto tiempo pasa un usuario en cada componente y guarda métricas de rendimiento (WPM, precisión, errores).

### Conceptos clave:

```typescript
// useRef se usa para guardar el timestamp sin causar re-renders
const startTimeRef = useRef<number | null>(null);
```

**¿Por qué useRef y no useState?**
- `useState` causa re-render cada vez que cambia
- `useRef` mantiene el valor entre renders SIN causar re-renders
- Perfecto para timestamps que no necesitan mostrarse en la UI

### Flujo de uso:

```typescript
// 1. Inicializar el hook
const { startTracking, stopTracking } = useActivityTracker('SpeedMode', 'speedMode');

// 2. Al iniciar una actividad (ej: usuario presiona "Start")
startTracking();  // Guarda Date.now() en startTimeRef

// 3. Al finalizar (ej: se acaba el tiempo o completa el texto)
stopTracking({
  wpm: 45,
  accuracy: 95,
  errors: 3,
  completed: true
});
// Calcula duración = Date.now() - startTimeRef
// Guarda todo en localStorage
```

---

## 🌍 useDynamicTranslations Hook

**Ubicación:** `src/hooks/useDynamicTranslations.ts`

### ¿Qué hace?
Proporciona traducciones dinámicas con soporte para variables interpoladas.

### Características:

#### 1. **Claves anidadas**
```typescript
// En es.json:
{
  "menu": {
    "items": {
      "game": "Juego"
    }
  }
}

// En el código:
t('menu.items.game')  // → "Juego"
```

**Cómo funciona:**
```typescript
// Divide la clave por puntos
const keys = 'menu.items.game'.split('.');  // ['menu', 'items', 'game']

// Navega por el objeto
let value = translations['es'];  // objeto completo
value = value['menu'];           // { items: { game: "Juego" } }
value = value['items'];          // { game: "Juego" }
value = value['game'];           // "Juego"
```

#### 2. **Interpolación de variables**
```typescript
// En es.json:
{
  "alerts": {
    "roleUpdated": "Usuario actualizado a {{role}} exitosamente"
  }
}

// En el código:
t('alerts.roleUpdated', { role: 'admin' })
// → "Usuario actualizado a admin exitosamente"
```

**Cómo funciona:**
```typescript
// Usa expresiones regulares para reemplazar {{variable}}
result.replace(new RegExp(`{{${varKey}}}`, 'g'), String(varValue));

// Ejemplo paso a paso:
// 1. Texto: "Usuario actualizado a {{role}} exitosamente"
// 2. varKey = 'role', varValue = 'admin'
// 3. RegExp busca: {{role}}
// 4. Reemplaza con: 'admin'
// 5. Resultado: "Usuario actualizado a admin exitosamente"
```

#### 3. **Fallback**
```typescript
t('clave.inexistente', 'Texto por defecto')
// Si no existe la traducción, usa 'Texto por defecto'
```

---

## 💾 Sistema de Activity Tracking

**Ubicación:** `src/utils/activityTracker.ts`

### Estructura de datos:

```typescript
interface ActivityLog {
  userId: string;              // 'user123' o 'anonymous'
  sourceComponent: string;     // 'SpeedMode', 'PlayGame', etc.
  activityType: activityType;  // 'speedMode', 'game', etc.
  startTime: Date;             // Cuando empezó
  endTime: Date;               // Cuando terminó
  duration: number;            // Segundos totales
  metadata?: {                 // Datos opcionales
    wpm?: number;
    accuracy?: number;
    errors?: number;
    completed?: boolean;
  };
}
```

### Funciones principales:

#### 1. **saveActivityLog(log)**
```typescript
// Guarda un log en localStorage

// Proceso:
// 1. Lee logs existentes de localStorage
const existingLogs = JSON.parse(localStorage.getItem('activity_logs') || '[]');

// 2. Añade el nuevo log al principio (más reciente primero)
const updatedLogs = [newLog, ...existingLogs];

// 3. Guarda de vuelta en localStorage
localStorage.setItem('activity_logs', JSON.stringify(updatedLogs));
```

**¿Por qué al principio del array?**
- Los logs más recientes son más relevantes
- Facilita mostrar "actividad reciente" sin ordenar

#### 2. **getActivityLogs()**
```typescript
// Recupera todos los logs

// Importante: Convierte strings de fecha a objetos Date
return parsedLogs.map(log => ({
  ...log,
  startTime: new Date(log.startTime),  // String → Date
  endTime: new Date(log.endTime)       // String → Date
}));
```

**¿Por qué convertir fechas?**
- localStorage solo guarda strings
- Las fechas se serializan como ISO strings: "2024-12-08T19:00:00.000Z"
- Necesitamos objetos Date para hacer cálculos y comparaciones

---

## 🎨 AdminDashboard - Lógica Compleja

**Ubicación:** `src/components/AdminDashboard.tsx`

### Agregación de datos:

```typescript
// Calcula estadísticas totales de todos los usuarios
const totalStats = usersData.reduce(
  (acc, user) => ({
    totalTime: acc.totalTime + user.totalTime,
    totalActivities: acc.totalActivities + user.totalActivities,
    avgWPM: acc.avgWPM + user.averageWPM,
    avgAccuracy: acc.avgAccuracy + user.averageAccuracy,
  }),
  { totalTime: 0, totalActivities: 0, avgWPM: 0, avgAccuracy: 0 }
);
```

**¿Qué es reduce?**
- Toma un array y lo "reduce" a un solo valor
- `acc` = acumulador (resultado parcial)
- En cada iteración, suma los valores del usuario actual al acumulador

**Ejemplo paso a paso:**
```javascript
// Usuarios: [
//   { totalTime: 100, totalActivities: 5 },
//   { totalTime: 200, totalActivities: 10 }
// ]

// Iteración 1:
// acc = { totalTime: 0, totalActivities: 0 }
// user = { totalTime: 100, totalActivities: 5 }
// resultado = { totalTime: 100, totalActivities: 5 }

// Iteración 2:
// acc = { totalTime: 100, totalActivities: 5 }
// user = { totalTime: 200, totalActivities: 10 }
// resultado = { totalTime: 300, totalActivities: 15 }
```

### Filtrado y ordenación:

```typescript
const filteredAndSortedUsers = usersData
  .filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  .sort((a, b) => {
    switch (sortBy) {
      case 'time': return b.totalTime - a.totalTime;  // Mayor a menor
      case 'wpm': return b.averageWPM - a.averageWPM;
      // ...
    }
  });
```

**Encadenamiento de métodos:**
1. `.filter()` - Filtra usuarios por email
2. `.sort()` - Ordena el resultado

**¿Por qué `b - a` y no `a - b`?**
- `a - b` = orden ascendente (menor a mayor)
- `b - a` = orden descendente (mayor a menor)
- Queremos mostrar primero los usuarios con más tiempo/WPM

---

## 🔑 Conceptos Clave de React

### useCallback
```typescript
const handleKeyPress = useCallback((event) => {
  // lógica...
}, [dependency1, dependency2]);
```

**¿Por qué useCallback?**
- Evita crear una nueva función en cada render
- Importante cuando la función se pasa como prop o se usa en useEffect
- Solo se recrea si cambian las dependencias

### useEffect con cleanup
```typescript
useEffect(() => {
  window.addEventListener('keydown', handleKeyPress);
  
  // Cleanup: se ejecuta cuando el componente se desmonta
  return () => {
    window.removeEventListener('keydown', handleKeyPress);
  };
}, [handleKeyPress]);
```

**¿Por qué cleanup?**
- Evita memory leaks
- Remueve event listeners que ya no se necesitan
- Se ejecuta antes de que el componente desaparezca

---

## 💡 Patrones Comunes

### 1. **Try-Catch en localStorage**
```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  console.error('Error:', error);
  // No rompe la app si localStorage está lleno o deshabilitado
}
```

### 2. **Optional Chaining**
```typescript
user?.role  // Si user es null/undefined, retorna undefined
            // Sin ?, daría error: "Cannot read property 'role' of null"
```

### 3. **Nullish Coalescing**
```typescript
value ?? defaultValue
// Si value es null o undefined, usa defaultValue
// Diferente de || que también considera '', 0, false
```

### 4. **Spread Operator**
```typescript
const newArray = [newItem, ...existingArray];
// Crea nuevo array con newItem al principio

const newObject = { ...oldObject, newProp: 'value' };
// Copia oldObject y añade/sobrescribe newProp
```

---

## 🎯 Mejores Prácticas Aplicadas

1. **Separación de responsabilidades**
   - Hooks para lógica reutilizable
   - Utils para funciones puras
   - Components solo para UI

2. **Inmutabilidad**
   - Nunca modificar arrays/objetos directamente
   - Siempre crear copias nuevas con spread operator

3. **Type Safety**
   - TypeScript para evitar errores
   - Interfaces claras para estructuras de datos

4. **Performance**
   - useCallback para funciones
   - useRef para valores que no afectan la UI
   - Evitar re-renders innecesarios
