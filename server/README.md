# Mecano Backend API

![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)

Backend API para la aplicación de mecanografía Mecano. Proporciona autenticación, gestión de usuarios, tracking de actividad y endpoints administrativos.

## 📚 Enlaces Rápidos

- **[📖 README Principal](../README.md)** - Documentación completa del proyecto
- **[📚 Documentación Técnica](../docs/README.md)** - Índice de documentación
- **[💻 Código Frontend](../src/)** - Código fuente del cliente

---

## 📋 Tabla de Contenidos

- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecutar el Servidor](#-ejecutar-el-servidor)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Base de Datos](#-base-de-datos)
- [Autenticación](#-autenticación)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## 🚀 Instalación

### Prerrequisitos

- **Node.js** v16 o superior
- **npm** o **yarn**
- **PostgreSQL** 14 o superior (recomendado: Neon Database)

### Pasos de Instalación

1. **Navegar al directorio del servidor**
```bash
cd server
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno** (ver sección siguiente)

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en el directorio `server/`:

```env
# === Base de Datos ===
DATABASE_URL=postgresql://usuario:contraseña@host:5432/nombre_db
# Ejemplo con Neon:
# DATABASE_URL=postgresql://user:pass@ep-xxx.region.aws.neon.tech/mecano_db?sslmode=require

# === Autenticación ===
JWT_SECRET=tu_clave_secreta_muy_segura_y_larga_aqui
# Generar con: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# === URLs ===
FRONTEND_URL=http://localhost:3000
# En producción: https://tu-dominio.com

# === Google OAuth (Opcional) ===
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_client_secret
# Obtener en: https://console.cloud.google.com

# === Servidor ===
PORT=3001
NODE_ENV=development
# En producción: NODE_ENV=production
```

### Configuración de Google OAuth (Opcional)

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Crear un nuevo proyecto
3. Habilitar **Google+ API**
4. Crear credenciales OAuth 2.0
5. Añadir URI de redirección autorizada:
   - Desarrollo: `http://localhost:3002/api/auth/google/callback`
   - Producción: `https://tu-dominio.com/api/auth/google/callback`
6. Copiar Client ID y Client Secret al `.env`

---

## 🏃 Ejecutar el Servidor

### Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

### Modo Producción
```bash
npm start
```

### Desde la raíz del proyecto
```bash
# Terminal 1: Backend
npm run server

# Terminal 2: Frontend
npm start

# O ambos simultáneamente:
npm run dev
```

El servidor estará disponible en `http://localhost:3001`

---

## 📁 Estructura del Proyecto

```
server/
├── index.js              # Punto de entrada principal
├── db.js                 # Configuración de PostgreSQL
├── package.json          # Dependencias y scripts
├── .env                  # Variables de entorno (no en git)
├── .env.example          # Plantilla de variables
│
├── auth/                 # Autenticación
│   ├── passport.js       # Configuración de Passport.js
│   └── strategies/       # Estrategias OAuth
│
├── routes/               # Endpoints de la API
│   ├── auth.js           # Autenticación y registro
│   ├── users.js          # Gestión de usuarios
│   ├── stats.js          # Estadísticas de práctica
│   ├── progress.js       # Progreso de usuario
│   ├── activity.js       # Activity tracking
│   ├── achievements.js   # Sistema de logros
│   ├── challenges.js     # Retos diarios
│   ├── social.js         # Features sociales
│   └── admin.js          # Panel de administración
│
└── middleware/           # Middleware personalizado
    ├── auth.js           # Verificación de JWT
    └── admin.js          # Verificación de rol admin
```

---

## 🔌 API Endpoints

### 🔐 Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Registro de usuario | No |
| `POST` | `/api/auth/login` | Inicio de sesión | No |
| `GET` | `/api/auth/me` | Usuario actual | Sí |
| `POST` | `/api/auth/logout` | Cerrar sesión | Sí |
| `GET` | `/api/auth/google` | Iniciar OAuth Google | No |
| `GET` | `/api/auth/google/callback` | Callback OAuth Google | No |

**Ejemplo de Registro:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123",
    "username": "usuario123"
  }'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "username": "usuario123",
    "role": "student"
  }
}
```

---

### 👥 Usuarios

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `GET` | `/api/users` | Lista de usuarios | Sí | Admin |
| `GET` | `/api/users/:id` | Obtener usuario | Sí | - |
| `PATCH` | `/api/users/:id` | Actualizar usuario | Sí | Admin |
| `PATCH` | `/api/users/:id/role` | Cambiar rol | Sí | Admin |
| `DELETE` | `/api/users/:id` | Eliminar usuario | Sí | Admin |
| `GET` | `/api/users/audit-logs` | Logs de auditoría | Sí | Admin |

---

### 📊 Estadísticas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/stats` | Guardar estadísticas | Sí |
| `GET` | `/api/stats/:userId` | Obtener estadísticas | Sí |
| `GET` | `/api/stats/:userId/summary` | Resumen de stats | Sí |

---

### 📈 Progreso

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/progress` | Actualizar progreso | Sí |
| `GET` | `/api/progress/:userId` | Obtener progreso | Sí |
| `POST` | `/api/progress/xp` | Añadir XP | Sí |

---

### 🎯 Activity Tracking

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/activity` | Guardar log de actividad | Sí |
| `GET` | `/api/activity` | Obtener logs | Sí |
| `GET` | `/api/activity/stats` | Estadísticas de actividad | Sí |

---

### 🏆 Logros y Retos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/achievements/:userId` | Logros de usuario | Sí |
| `POST` | `/api/achievements/unlock` | Desbloquear logro | Sí |
| `GET` | `/api/challenges/daily` | Reto diario actual | Sí |
| `POST` | `/api/challenges/complete` | Completar reto | Sí |

---

### 👥 Social

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/social/follow/:userId` | Seguir usuario | Sí |
| `DELETE` | `/api/social/unfollow/:userId` | Dejar de seguir | Sí |
| `GET` | `/api/social/profile/:userId` | Perfil público | No |
| `GET` | `/api/social/posts` | Posts del foro | Sí |
| `POST` | `/api/social/posts` | Crear post | Sí |
| `POST` | `/api/social/posts/:id/like` | Like a post | Sí |
| `POST` | `/api/social/posts/:id/comment` | Comentar post | Sí |

---

### 🔧 Admin

| Método | Endpoint | Descripción | Auth | Rol |
|--------|----------|-------------|------|-----|
| `GET` | `/api/admin/activity` | Actividad global | Sí | Admin |
| `GET` | `/api/admin/stats` | Estadísticas globales | Sí | Admin |
| `GET` | `/api/admin/users/:id/achievements` | Logros de usuario | Sí | Admin |

---

## 🗄️ Base de Datos

### Esquema de Tablas

#### `users`
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),  -- NULL para OAuth
  role VARCHAR(20) DEFAULT 'student',  -- 'student' | 'admin'
  google_id VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `user_sessions`
```sql
CREATE TABLE user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `activity_logs`
```sql
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  source_component VARCHAR(100) NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration INTEGER NOT NULL,  -- en segundos
  metadata JSONB,  -- { wpm, accuracy, errors, completed }
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `stats`
```sql
CREATE TABLE stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  wpm DECIMAL(5,2),
  accuracy DECIMAL(5,2),
  errors INTEGER,
  time_spent INTEGER,  -- en segundos
  mode VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `achievements`
```sql
CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

#### `daily_challenges`
```sql
CREATE TABLE daily_challenges (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL,
  challenge_type VARCHAR(50),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP,
  UNIQUE(user_id, challenge_date)
);
```

#### `social_follows`
```sql
CREATE TABLE social_follows (
  id SERIAL PRIMARY KEY,
  follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);
```

#### `forum_posts`
```sql
CREATE TABLE forum_posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Inicialización de Base de Datos

Las tablas se crean automáticamente al iniciar el servidor por primera vez. El código de inicialización está en `server/db.js`.

### Migraciones

Para cambios en el esquema, modificar las queries de creación en `db.js` y reiniciar el servidor.

---

## 🔐 Autenticación

### Sistema de JWT

El servidor usa **JSON Web Tokens (JWT)** para autenticación:

1. Usuario se registra o inicia sesión
2. Servidor genera un JWT firmado con `JWT_SECRET`
3. Cliente guarda el token (localStorage)
4. Cliente envía el token en cada request: `Authorization: Bearer <token>`
5. Servidor verifica el token en middleware

**Expiración:** 24 horas

### Middleware de Autenticación

```javascript
// Proteger rutas
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contiene los datos del usuario
  res.json({ user: req.user });
});
```

### Sistema de Roles

- **Primer usuario** → Automáticamente `admin`
- **Usuarios subsecuentes** → `student` por defecto
- **Promoción** → Solo admins pueden cambiar roles

---

## 🚀 Deployment

### Neon Database (Recomendado)

1. Crear cuenta en [Neon](https://neon.tech)
2. Crear nuevo proyecto
3. Copiar connection string a `DATABASE_URL`
4. Asegurar que incluye `?sslmode=require`

### Render / Railway / Heroku

1. **Variables de entorno:** Configurar todas las del `.env`
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. **Puerto:** Usar `process.env.PORT`

### Docker (Opcional)

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

**Solución:**
- Verificar que `DATABASE_URL` es correcto
- Comprobar que PostgreSQL está corriendo
- Verificar firewall/red si es base de datos remota

### Error: "JWT malformed"

**Solución:**
- Verificar que `JWT_SECRET` está configurado
- Comprobar que el token se envía correctamente
- Limpiar localStorage del cliente

### Error: "Port 3001 already in use"

**Solución:**
```bash
# Linux/Mac
lsof -ti:3001 | xargs kill -9

# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Error: "Google OAuth not working"

**Solución:**
- Verificar `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
- Comprobar redirect URI en Google Console
- Verificar que `FRONTEND_URL` es correcto

---

## 📦 Dependencias Principales

```json
{
  "express": "^4.18.0",           // Framework web
  "postgres": "^3.4.0",           // Cliente PostgreSQL
  "bcrypt": "^5.1.0",             // Hashing de contraseñas
  "jsonwebtoken": "^9.0.0",       // JWT auth
  "passport": "^0.6.0",           // OAuth strategies
  "passport-google-oauth20": "^2.0.0",  // Google OAuth
  "cors": "^2.8.5",               // CORS middleware
  "dotenv": "^16.0.0"             // Variables de entorno
}
```

---

## 🧪 Testing

```bash
# Ejecutar tests del servidor
npm test

# Tests con cobertura
npm run test:coverage
```

---

## 📝 Logs y Debugging

### Modo Debug
```bash
DEBUG=* npm run dev
```

### Logs de Auditoría

Todas las acciones administrativas se registran en `audit_logs`:
- Cambios de rol
- Eliminación de usuarios
- Modificaciones de datos

---

## 🔗 Enlaces Útiles

- **[README Principal](../README.md)** - Documentación completa
- **[Documentación de Código](../docs/CODE_DOCUMENTATION.md)** - Hooks y utilidades
- **[Frontend Source](../src/)** - Código del cliente
- **[PostgreSQL Docs](https://www.postgresql.org/docs/)** - Documentación oficial
- **[Express.js Guide](https://expressjs.com/en/guide/routing.html)** - Guía de Express

---

## 📄 Licencia

MIT License - Ver archivo [LICENSE](../LICENSE) para más detalles.

---

**Desarrollado con ❤️ para Mecano**
