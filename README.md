# Mecano - Aplicación de Mecanografía

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Una aplicación web completa de práctica de mecanografía con múltiples modos de juego, estadísticas avanzadas, sistema de logros y características sociales.

## 🚀 Características Principales

### 🎮 Modos de Práctica
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

### 👥 Características Sociales
- **Perfiles Públicos**: Comparte logros y estadísticas
- **Sistema de Seguidores**: Sigue a otros usuarios
- **Comunidad/Foro**: Publicaciones, likes, comentarios
- **Clasificación Global**: Compite con otros usuarios
- **Sistema de Logros**: Desbloquea medallas y trofeos

### 🎯 Gamificación
- **Sistema de Retos Diarios**: Desafíos personalizados cada 24h
- **Temas Estacionales**: Retos adaptados a festividades (Navidad, Halloween, etc.)
- **Sistema de Achievements**: 15+ logros desbloqueables
- **Tabla de Clasificación**: Rankings globales
- **Niveles de Usuario**: Sistema de XP y progresión
- **Estadísticas Detalladas**: Seguimiento completo del rendimiento

### 🔐 Autenticación y Usuarios
- **Registro/Login**: Sistema completo de autenticación
- **Roles de Usuario**: Estudiante y Administrador
- **Seguridad**: El primer usuario es automáticamente administrador
- **Panel de Admin**: Gestión de usuarios (solo admins)
- **Perfil de Usuario**: Visualización de actividad y estadísticas

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
- ✅ Tests de componentes (28+ archivos)
- ✅ Tests de analytics (HeatMap, PatternAnalysis, ProgressPredictor, RecommendationEngine)
- ✅ Tests de features sociales
- ✅ Tests de autenticación
- ✅ 122 tests en total

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
- **Promoción de Roles**: Solo administradores pueden promover usuarios
- **Sin Selector Público**: Los usuarios NO pueden elegir ser admin al registrarse

### Autenticación
- Contraseñas hasheadas con bcrypt
- JWT para sesiones
- Tokens con expiración de 24h
- Validación de inputs
- Protección contra SQL injection

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
GET    /api/users           - Lista de usuarios
PUT    /api/users/:id/role  - Cambiar rol de usuario
DELETE /api/users/:id       - Eliminar usuario
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
