# Mecano - Aplicación de Mecanografía

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Tabla de Contenidos
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Documentación](#documentación)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## 📚 Documentación

Para entender el código en profundidad, consulta nuestra documentación técnica:


## ✨ Características

### Para Usuarios
- 🎯 **12 Modos de Práctica** diferentes con instrucciones detalladas
- 📊 **Seguimiento de Progreso** con estadísticas detalladas
- 🏆 **Sistema de Logros** para motivar el aprendizaje
- ⭐ **Sistema de Niveles y XP** - Gana experiencia y sube de nivel
- 🎯 **Retos Diarios** - Popup motivador con retos temáticos
- 👥 **Características Sociales**: Clasificación, perfiles públicos, sistema de amigos
- 🎮 **Modo Competitivo**: Carreras en tiempo real con otros usuarios
- 🌍 **Multiidioma**: Soporte para español e inglés
- 🌓 **Modo Oscuro/Claro** con diseño moderno
- 💾 **Guardado Automático** de progreso y configuración

### Para Administradores
- 📊 **Panel de Administración Centralizado** con 6 pestañas:
  1. **👥 Gestión de Usuarios**: Editar, eliminar usuarios y gestionar roles
  2. **📈 Actividad y Estadísticas**: Métricas globales, gráficos y análisis
  3. **🏆 Logros de Usuarios**: Ver logros desbloqueados por cada usuario (doble click en usuario)
  4. **⭐ Retos y Niveles**: Sistema de XP, niveles de usuarios y estadísticas de retos
  5. **📊 Tracking Detallado**: Seguimiento avanzado de actividad
  6. **📜 Historial de Auditoría**: Registro de acciones administrativas
- 🔐 **Control de Acceso** basado en roles
- 📉 **Visualizaciones** de datos con gráficos interactivos
- 🔍 **Búsqueda y Filtros** avanzados
- 🌐 **Interfaz Completamente en Español**

#### Acceso al Panel de Administración
Para acceder al panel de admin, inicia sesión como administrador y:
- **Opción 1**: Click en tu foto/nombre (esquina superior derecha) → "Panel de Admin"
- **Opción 2**: En el menú lateral izquierdo → "Panel de Admin"
- **Opción 3**: En el menú móvil (☰) → "Panel de Admin"

## 🎮 Modos de Práctica
- **Niveles Progresivos**: 10 niveles con dificultad creciente
- **Práctica Libre**: Selección personalizada de teclas sin límites
- **Modo Velocidad**: Textos cortos para mejorar WPM
- **Modo Precisión**: Enfocado en reducir errores
- **Modo Zen**: Práctica relajada sin presión
- **Modo Números**: Práctica de teclado numérico
- **Modo Símbolos**: Caracteres especiales
- **Modo Código**: Para programadores
- **Modo Dictado**: Escritura mientras se escucha audio
- **Juego de Letras**: Modo arcade divertido

### 📊 Analíticas Avanzadas
- **Dashboard de Progreso**: Visualización gráfica de evolución
- **Heat Map**: Mapa de calor de errores por tecla
- **Análisis de Patrones**: Identificación de errores recurrentes
- **Predictor de Progreso**: Estimación de tiempo para alcanzar objetivos
- **Recomendaciones IA**: Sugerencias personalizadas de práctica
- **Exportación de Datos**: Descarga de estadísticas en CSV/JSON
- **Activity Tracking**: Sistema completo de seguimiento de actividad del usuario
- **Visualizaciones de Datos**: Gráficos interactivos de uso por componente y tipo

### 👥 Características Sociales
- **Perfiles Públicos**: Comparte logros y estadísticas
- **Sistema de Seguidores**: Sigue a otros usuarios
- **Comunidad/Foro**: Publicaciones, likes, comentarios
- **Clasificación Global**: Compite con otros usuarios
- **Sistema de Logros**: Desbloquea medallas y trofeos

### 🎯 Sistema de Gamificación

#### ⭐ Sistema de Niveles y XP
**Gana experiencia y sube de nivel mientras practicas:**
- **Fórmula de Progresión**: Nivel N requiere `100 * N * (N-1) / 2` XP
- **Recompensas de XP**:
  - Completar reto diario: **50 XP**
  - Completar nivel de práctica: **20 XP**
  - 10 minutos de práctica: **10 XP**
  - Alcanzar 60 WPM: **30 XP**
  - Alcanzar 95% precisión: **25 XP**

**Visualización:**
- Badge de nivel con gradiente dorado
- Barra de progreso animada (efecto shimmer)
- XP actual y XP necesario para siguiente nivel
- Visible en perfil de usuario y admin dashboard

#### 🎯 Retos Diarios
**Popup motivador que aparece al iniciar sesión:**
- **Retos Temáticos**: Navidad 🎄, Año Nuevo 🎆, Halloween 🎃, San Valentín 💖
- **Retos Genéricos**: Velocidad ⚡, Precisión 🎯, Resistencia 🔥, Estrella 🌟, Diamante 💎
- **Características**:
  - Aparece una vez al día
  - Diseño colorido con gradientes temáticos
  - Mensajes motivadores personalizados
  - Barra de progreso con animación
  - Otorga 50 XP al completarse
  - Tracking completo en admin dashboard

#### 🏆 Sistema de Logros
- **15+ Logros Desbloqueables**: Desde principiante hasta maestro
- **Categorías**: Velocidad, Precisión, Práctica, Completitud
- **Visualización**: Modal con logros desbloqueados y bloqueados
- **Admin View**: Los administradores pueden ver logros de cualquier usuario

#### 📊 Estadísticas y Tracking
- **Activity Tracking**: Sistema completo de seguimiento
- **Visualizaciones**: Gráficos interactivos por componente y tipo
- **Tabla de Clasificación**: Rankings globales
- **Efectos Visuales**: Partículas al acertar teclas

### 🔐 Autenticación y Usuarios
- **Registro/Login**: Sistema completo de autenticación
- **Roles de Usuario**: Estudiante y Administrador
- **Seguridad**: El primer usuario es automáticamente administrador
- **Panel de Admin**: Gestión de usuarios con promoción de roles desde UI
- **Dashboard de Administrador**: Visualización de actividad de todos los usuarios
- **Perfil de Usuario**: Visualización de actividad y estadísticas
- **Gestión de Roles**: Promoción/degradación de usuarios sin scripts

### 🌍 Internacionalización
- **4 Idiomas Soportados**:
  - Español (Castellano)
  - English
  - Català
  - Valencià

### 🎨 Interfaz y UX
- **Modo Oscuro/Claro**: Temas personalizables
- **Diseño Responsivo**: Adaptado a todos los dispositivos
- **Accesibilidad**: Soporte ARIA y navegación por teclado
- **Teclado Visual**: Representación interactiva
- **Visualización de Manos**: Guía de posición de dedos
- **Dropdowns Mejorados**: Con búsqueda, navegación por teclado y favoritos
- **Animaciones Suaves**: Transiciones fluidas con Framer Motion
- **Efectos Visuales**: Partículas y feedback visual mejorado

## 📦 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- npm o yarn
- PostgreSQL (para base de datos)

### Configuración

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd mecano_prueba_web
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:
```env
# Base de datos
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/mecano_db

# JWT Secret
JWT_SECRET=tu_clave_secreta_muy_segura

# API URL (opcional para desarrollo)
REACT_APP_API_URL=http://localhost:5000

# Frontend URL (para OAuth)
FRONTEND_URL=http://localhost:3000

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
```

4. **Inicializar base de datos**
```bash
npm run init-db
```

5. **Iniciar el servidor**
```bash
# Terminal 1: Servidor backend
npm run server

# Terminal 2: Cliente frontend
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests con cobertura
npm test -- --coverage

# Tests específicos
npm test HeatMap.test.tsx
```

### Suite de Tests
- ✅ Tests de componentes (31+ archivos)
- ✅ Tests de analytics (HeatMap, PatternAnalysis, ProgressPredictor, RecommendationEngine)
- ✅ Tests de features sociales
- ✅ Tests de autenticación
- ✅ Tests de UI (ParticleExplosion, EnhancedDropdown, ActivityChart)
- ✅ 130+ tests en total

## 🏗️ Arquitectura del Proyecto

```
mecano_prueba_web/
├── src/
│   ├── components/          # Componentes React
│   │   ├── social/          # Componentes sociales
│   │   ├── analytics/       # Componentes de analíticas
│   │   └── ...
│   ├── context/             # React Contexts
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   ├── LanguageContext.tsx
│   │   └── MultiplayerContext.tsx
│   ├── hooks/               # Custom Hooks
│   ├── translations/        # Archivos de i18n
│   ├── api/                 # Clientes API
│   ├── tests/               # Tests unitarios
│   └── utils/               # Utilidades
├── server/                  # Backend Node.js
│   ├── routes/              # Rutas API
│   ├── auth/                # Autenticación
│   ├── db.js                # Configuración DB
│   └── index.js             # Servidor principal
└── public/                  # Assets estáticos
```

## 🔑 Características de Seguridad

### Sistema de Roles
- **Primer Usuario**: Se convierte automáticamente en **Administrador**
- **Usuarios Subsecuentes**: Se registran como **Estudiante** por defecto
- **Promoción de Roles**: Administradores pueden promover usuarios desde el Dashboard
- **Sin Selector Público**: Los usuarios NO pueden elegir ser admin al registrarse
- **UI de Gestión**: Botones de "Hacer Admin" / "Quitar Admin" en el panel de administración
- **Protección**: Los administradores no pueden cambiar su propio rol

### Autenticación
- Contraseñas hasheadas con bcrypt
- JWT para sesiones
- Tokens con expiración de 24h
- Validación de inputs
- Protección contra SQL injection

### Admin Dashboard
- **Acceso Restringido**: Solo usuarios con rol 'admin'
- **Gestión de Usuarios**: Ver, promover y degradar usuarios
- **Visualización de Actividad**: Gráficos de uso por componente
- **Estadísticas Globales**: Métricas agregadas de todos los usuarios
- **Búsqueda y Filtros**: Encontrar usuarios rápidamente
- **Logs de Auditoría**: Registro de cambios administrativos

## 📚 API Backend

### Endpoints Principales

#### Autenticación
```
POST /api/auth/register    - Registro de usuario
POST /api/auth/login       - Inicio de sesión
GET  /api/auth/me          - Información del usuario actual
POST /api/auth/logout      - Cerrar sesión
GET  /api/auth/google      - OAuth Google
```

#### Estadísticas
```
POST /api/stats            - Guardar estadísticas
GET  /api/stats/:userId    - Obtener estadísticas
```

#### Progreso
```
POST /api/progress         - Actualizar progreso
GET  /api/progress/:userId - Obtener progreso
```

#### Social
```
POST /api/social/follow/:userId     - Seguir usuario
GET  /api/social/profile/:userId    - Perfil público
GET  /api/social/posts              - Posts del foro
POST /api/social/posts              - Crear post
POST /api/social/posts/:id/like     - Like a post
```

#### Usuarios (Admin)
```
GET    /api/users              - Lista de usuarios
PATCH  /api/users/:id/role     - Cambiar rol de usuario
PATCH  /api/users/:id          - Actualizar usuario
DELETE /api/users/:id          - Eliminar usuario
GET    /api/users/audit-logs   - Logs de auditoría
```

#### Admin Dashboard
```
GET    /api/admin/activity     - Actividad de todos los usuarios
```

#### Activity Tracking
```
POST   /api/activity           - Guardar log de actividad
GET    /api/activity           - Obtener logs de actividad
GET    /api/activity/stats     - Estadísticas de actividad
```

## 🎯 Scripts Disponibles

```json
{
  "start": "react-scripts start",          // Desarrollo frontend
  "server": "node server/index.js",        // Servidor backend
  "dev": "concurrently \"npm run server\" \"npm start\"", // Ambos simultáneamente
  "build": "react-scripts build",          // Build producción
  "test": "react-scripts test",            // Tests
  "eject": "react-scripts eject"          // Eject CRA
}
```

## 🛠️ Stack Tecnológico

### Frontend
- **React 18**: Framework principal
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos
- **Framer Motion**: Animaciones
- **Recharts**: Gráficos
- **React Router**: Navegación
- **React Icons**: Iconografía

### Backend
- **Node.js**: Runtime
- **Express**: Framework web
- **PostgreSQL**: Base de datos
- **Postgres.js**: Cliente DB
- **bcrypt**: Hashing de contraseñas
- **jsonwebtoken**: JWT auth
- **Passport**: OAuth strategies

### Testing
- **Jest**: Test runner
- **React Testing Library**: Tests de componentes
- **@testing-library/jest-dom**: Matchers personalizados

## 📈 Roadmap Futuro

### En Desarrollo 🚧
- [ ] Modo Multijugador en tiempo real
- [ ] PWA (Progressive Web App)
- [ ] App móvil nativa (React Native)
- [ ] Integración con APIs de libros
- [ ] Sistema de tutorías

### Planificado 📝
- [ ] Torneos y eventos programados
- [ ] Chat en vivo
- [ ] Temas visuales personalizables
- [ ] Soporte para más idiomas
- [ ] Analytics con Machine Learning

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado con ❤️ para mejorar las habilidades de mecanografía

## 🙏 Agradecimientos

- Create React App por el boilerplate inicial
- Comunidad de React por las increíbles herramientas
- Todos los contribuidores y testers

---

⌨️ **¡Empieza a practicar y mejora tu velocidad de escritura!** 🚀
