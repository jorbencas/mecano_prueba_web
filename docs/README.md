# 📚 Documentación Técnica de Mecano

Bienvenido a la documentación técnica del proyecto. Aquí encontrarás detalles sobre la arquitectura, patrones de diseño y guías de desarrollo.

## 🗂 Índice

### 1. 📖 [Documentación de Código](CODE_DOCUMENTATION.md)
Guía detallada sobre los patrones internos del frontend:
- **Hooks Personalizados**: `useActivityTracker`, `useDynamicTranslations`
- **Sistema de Tracking**: Cómo funciona el registro de actividad
- **Admin Dashboard**: Lógica de agregación y filtrado
- **Patrones React**: Uso de `useCallback`, `useEffect`, optimizaciones

### 2. 🔧 [Backend API](../server/README.md)
Documentación del servidor Node.js/Express:
- **Endpoints**: Lista completa de rutas API
- **Base de Datos**: Esquema de tablas PostgreSQL
- **Autenticación**: Flujo JWT y OAuth
- **Deployment**: Guías para producción

### 3. 🏗 Arquitectura General
El proyecto sigue una arquitectura cliente-servidor clásica:

- **Frontend (`/src`)**: SPA construida con React, TypeScript y Tailwind.
- **Backend (`/server`)**: API RESTful con Express y PostgreSQL.

### 4. 🧪 Testing
La estrategia de testing se divide en:
- **Unit Tests**: Para utilidades y hooks
- **Component Tests**: Usando React Testing Library
- **Integration Tests**: Flujos completos de usuario

## 🤝 Guías de Contribución

### Estilo de Código
- Usamos **ESLint** y **Prettier**
- Componentes funcionales con **TypeScript** estricto
- **Tailwind** para estilos (evitar CSS puro cuando sea posible)

### Flujo de Trabajo
1. Crear rama `feature/nombre-feature`
2. Desarrollar y añadir tests
3. Verificar con `npm test`
4. PR a `main`
