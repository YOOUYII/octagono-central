# PLAN DE TRABAJO — OCTÁGONO CENTRAL
## Documento para Agente de IA (Claude)

---

## DESCRIPCIÓN DEL PROYECTO

**Octágono Central** es una plataforma integral de noticias, análisis técnico y comunidad para entusiastas de las Artes Marciales Mixtas (MMA/UFC) en español.

### Propósito
Llenar el vacío de información analítica en español sobre MMA. La mayoría de sitios en español solo publican noticias cortas; Octágono Central busca elevar la conversación con análisis profundo, estadísticas y comunidad activa.

### Público objetivo
- **Fanático**: Busca estadísticas avanzadas, datos técnicos de grappling/striking, no se pierde las preliminares.
- **Espectador casual**: Ve los eventos grandes, necesita entender por qué un peleador es favorito y qué significan ciertos términos.

---

## STACK TECNOLÓGICO

| Capa | Tecnología |
|---|---|
| Frontend | Angular (estructura ya creada) + PrimeNG |
| Estilos | TailwindCSS (ya instalado en el proyecto) + PrimeNG Theme |
| Backend | Node.js + Express (microservicios) |
| API Gateway | Express Gateway |
| Base de datos | PostgreSQL en Supabase |
| Autenticación | JWT + WebAuthn (biometría) |
| Email | Brevo API (el usuario ya tiene su API key) |
| Hosting sugerido | Vercel (frontend) / Railway o Render (microservicios) |

---

## ARQUITECTURA DE MICROSERVICIOS

```
Angular (Frontend)
      |
      v
Express Gateway  :8000  (punto de entrada único)
      |
      |---> auth-service      :3001
      |---> fighters-service  :3002
      |---> events-service    :3003
      |---> news-service      :3004
      |---> predictions-service :3005
```

Cada microservicio se conecta a **su propio schema** dentro de PostgreSQL en Supabase usando la **service_role key** (bypasea RLS). Angular solo usa la **anon key** para lecturas públicas directas si se necesita, pero preferentemente todo pasa por el Gateway.

---

## BASE DE DATOS (Supabase / PostgreSQL)

> **IMPORTANTE**: El schema ya fue ejecutado en Supabase en dos partes (v1 y v2). Las tablas ya existen. No volver a crearlas. Solo usarlas.

### Tablas existentes

#### `users`
```sql
id                        UUID PK
email                     TEXT UNIQUE NOT NULL
password_hash             TEXT NOT NULL
name                      TEXT NOT NULL
avatar_url                TEXT
role                      TEXT DEFAULT 'user'  -- 'user' | 'admin'
status                    SMALLINT DEFAULT 0   -- 0=inactivo, 1=activo
email_verified            BOOLEAN DEFAULT FALSE
email_verification_token  TEXT
token_expires_at          TIMESTAMPTZ
created_at                TIMESTAMPTZ
updated_at                TIMESTAMPTZ
```

#### `biometric_credentials`
```sql
id             UUID PK
user_id        UUID FK -> users(id)
credential_id  TEXT UNIQUE  -- WebAuthn credential ID
public_key     TEXT         -- clave pública cifrada
device_name    TEXT
last_used_at   TIMESTAMPTZ
created_at     TIMESTAMPTZ
```

#### `fighters`
```sql
id             UUID PK
name           TEXT
nickname       TEXT
nationality    TEXT
weight_class   TEXT
fighting_style TEXT
wins / losses / draws / no_contests  INT
wins_ko / wins_sub / wins_dec        INT
reach_cm / height_cm  NUMERIC
dob            DATE
image_url      TEXT
bio            TEXT
created_at / updated_at  TIMESTAMPTZ
```

#### `events`
```sql
id          UUID PK
name        TEXT
location    TEXT
venue       TEXT
event_date  TIMESTAMPTZ
status      TEXT  -- 'upcoming' | 'live' | 'completed' | 'cancelled'
poster_url  TEXT
created_at / updated_at  TIMESTAMPTZ
```

#### `fights`
```sql
id             UUID PK
event_id       UUID FK -> events(id)
fighter1_id    UUID FK -> fighters(id)
fighter2_id    UUID FK -> fighters(id)
winner_id      UUID FK -> fighters(id)
weight_class   TEXT
result_method  TEXT  -- 'KO/TKO' | 'Submission' | 'Decision' | 'DQ' | 'No Contest'
result_round   INT
result_time    TEXT
is_main_event  BOOLEAN
is_title_fight BOOLEAN
card_order     INT
created_at     TIMESTAMPTZ
```

#### `fight_stats`
```sql
id                       UUID PK
fight_id                 UUID FK -> fights(id)
fighter_id               UUID FK -> fighters(id)
sig_strikes_landed       INT
sig_strikes_attempted    INT
total_strikes_landed     INT
total_strikes_attempted  INT
takedowns_landed         INT
takedowns_attempted      INT
submission_attempts      INT
knockdowns               INT
ctrl_time_seconds        INT
```

#### `news`
```sql
id              UUID PK
author_id       UUID FK -> users(id)  -- solo usuarios con role='admin'
title           TEXT
slug            TEXT UNIQUE
content         TEXT
cover_image_url TEXT
category        TEXT  -- 'general' | 'noticias' | 'octágono' | 'fuera-del-octágono'
status          TEXT  -- 'draft' | 'published' | 'archived'
published_at    TIMESTAMPTZ
created_at / updated_at  TIMESTAMPTZ
```

#### `predictions`
```sql
id         UUID PK
fight_id   UUID FK -> fights(id)
title      TEXT
is_active  BOOLEAN
closes_at  TIMESTAMPTZ
created_at TIMESTAMPTZ
```

#### `prediction_votes`
```sql
id            UUID PK
prediction_id UUID FK -> predictions(id)
fighter_id    UUID FK -> fighters(id)
session_id    TEXT   -- limita un voto por sesión
created_at    TIMESTAMPTZ
UNIQUE (prediction_id, session_id)
```

---

## ESTRUCTURA DEL PROYECTO ANGULAR

El proyecto Angular **ya existe** con esta estructura. El agente debe verificar cada carpeta y crearla si no existe antes de generar componentes.

```
src/
  app/
    components/     -- componentes reutilizables (verificar/crear)
    directives/     -- directivas personalizadas (verificar/crear)
    guards/         -- route guards (verificar/crear)
    interceptors/   -- JWT interceptor (verificar/crear)
    layouts/        -- header, footer, sidebar (verificar/crear)
    models/         -- interfaces TypeScript (verificar/crear)
    pages/          -- páginas del sitio (verificar/crear)
    services/       -- servicios HTTP (verificar/crear)
```

### Regla obligatoria para crear componentes
**SIEMPRE** usar el siguiente comando para crear páginas:
```bash
ng g c pages/NOMBRE-PAGINA
```
Ejemplo:
```bash
ng g c pages/home
ng g c pages/news
ng g c pages/fighters
```

Para componentes reutilizables:
```bash
ng g c components/NOMBRE-COMPONENTE
```

Para guards:
```bash
ng g g guards/NOMBRE-GUARD
```

Para servicios:
```bash
ng g s services/NOMBRE-SERVICE
```

---

## ESTRUCTURA DEL SITIO WEB

### Layout estándar (todas las páginas)
```
+------------------------------------------+
|  HEADER                                  |
|  Logo | Nav Menu | Login/Avatar           |
+------------------------------------------+
|                                          |
|  CONTENIDO PRINCIPAL                     |
|  (cambia por página)                     |
|                                          |
+------------------------------------------+
|  FOOTER                                  |
|  Links | Redes sociales | Copyright      |
+------------------------------------------+
```

### Menú de navegación
- **Inicio** — slider con las 3 noticias/peleas más importantes
- **Noticias** — actualidad diaria (pesajes, lesiones, anuncios)
- **El Octágono** — reseñas de eventos y debates
- **Calendario** — próximas carteleras (Main Card y Preliminares)
- **Enciclopedia Fighter** — fichas de peleadores
- **Predicciones** — encuestas de votación

### Páginas a crear

| Comando | Ruta | Descripción |
|---|---|---|
| `ng g c pages/home` | `/` | Inicio con slider |
| `ng g c pages/news` | `/noticias` | Listado de noticias |
| `ng g c pages/news-detail` | `/noticias/:slug` | Detalle de noticia |
| `ng g c pages/octagon` | `/octágono` | Reseñas y debates |
| `ng g c pages/calendar` | `/calendario` | Carteleras y eventos |
| `ng g c pages/event-detail` | `/calendario/:id` | Detalle de evento |
| `ng g c pages/fighters` | `/enciclopedia` | Listado de peleadores |
| `ng g c pages/fighter-detail` | `/enciclopedia/:id` | Ficha de peleador |
| `ng g c pages/predictions` | `/predicciones` | Encuestas activas |
| `ng g c pages/login` | `/login` | Inicio de sesión |
| `ng g c pages/register` | `/registro` | Registro de usuario |
| `ng g c pages/profile` | `/perfil` | Perfil de usuario |
| `ng g c pages/admin` | `/admin` | Panel administrador |
| `ng g c pages/not-found` | `**` | Página 404 |

---

## SEGURIDAD Y AUTENTICACIÓN

### Flujo de registro
1. Usuario llena formulario (nombre, email, password)
2. `auth-service` hashea la password con `bcrypt`
3. Se crea el usuario en BD con `status = 0` y `email_verified = false`
4. Se genera un `email_verification_token` (UUID o JWT corto, expira en 24h)
5. Se guarda `token_expires_at` en BD
6. Se envía correo de confirmación via **Brevo API**
7. Usuario hace clic en el enlace → `auth-service` valida el token
8. Si válido: `status = 1`, `email_verified = true`, token se limpia en BD
9. Usuario ya puede iniciar sesión

### Flujo de login
1. Usuario ingresa email + password
2. `auth-service` busca usuario por email
3. **Verifica `status === 1`** — si es 0, rechaza con mensaje "Cuenta inactiva o no confirmada"
4. Compara password con `bcrypt.compare`
5. Si correcto: genera JWT (payload: `id`, `email`, `role`, `status`)
6. Devuelve JWT al frontend
7. Angular guarda el JWT en `localStorage` o `sessionStorage`
8. El `interceptor` adjunta el JWT en cada request posterior

### Campo `status` — reglas
- `0` = inactivo: no puede iniciar sesión. Ocurre cuando:
  - Usuario recién registrado (no ha confirmado email)
  - Administrador dio de baja al usuario
- `1` = activo: puede iniciar sesión normalmente
- **Solo el administrador** puede cambiar `status` de forma manual desde el panel

### Brevo (correo transaccional)
El usuario ya tiene su API key de Brevo. El agente debe:
1. Crear la función de envío en `auth-service/src/services/email.service.js`
2. Usar la variable de entorno `BREVO_API_KEY=TU_API_KEY_AQUI`
3. Indicar claramente en el código con un comentario `// 🔑 PON TU BREVO_API_KEY EN EL .env`

Estructura de la función:
```javascript
// auth-service/src/services/email.service.js
const sendVerificationEmail = async (toEmail, toName, verificationLink) => {
  // Usa fetch o axios a https://api.brevo.com/v3/smtp/email
  // Header: api-key: process.env.BREVO_API_KEY  <-- 🔑 PON TU KEY EN .env
  // Body: sender, to, subject, htmlContent con el link
};
```

### Biometría (WebAuthn / huella dactilar)
El usuario tiene lector de huellas en su computadora. Se usa la **Web Authentication API (WebAuthn)** estándar del navegador.

**Flujo de registro de huella:**
1. Usuario ya está logueado (tiene JWT válido)
2. En su perfil, hace clic en "Registrar huella dactilar"
3. Angular llama al `auth-service` para obtener un `challenge`
4. El navegador solicita la huella al sistema operativo (nativo)
5. El autenticador devuelve `credential_id` y `public_key`
6. Angular envía estos datos al `auth-service`
7. Se guardan en la tabla `biometric_credentials`

**Flujo de login con huella:**
1. Usuario en pantalla de login hace clic en "Iniciar con huella"
2. Angular llama al `auth-service` para obtener el challenge
3. El navegador solicita la huella al sistema operativo
4. El autenticador firma el challenge con la clave privada
5. `auth-service` verifica la firma contra la `public_key` guardada
6. Si válido: genera JWT igual que login normal
7. **Verifica `status === 1`** antes de emitir el JWT

**Librerías a usar en auth-service:**
```bash
npm install @simplewebauthn/server  # para verificación en el servidor
```
**En Angular:**
```bash
npm install @simplewebauthn/browser  # para interacción con el autenticador
```

---

## PARTE 1 — ESTRUCTURA BASE + API GATEWAY + AUTH SERVICE

> Iniciar aquí. Cuando se completen todas las tareas de esta parte, detener y esperar instrucción para continuar con la Parte 2.

### Tarea 1.1 — Verificar/crear estructura de carpetas en Angular

```bash
# Verificar y crear si no existen:
src/app/components/
src/app/directives/
src/app/guards/
src/app/interceptors/
src/app/layouts/
src/app/models/
src/app/pages/
src/app/services/
```

Para cada carpeta: si no existe → crearla. Si existe → confirmar y continuar.

### Tarea 1.2 — Estructura de microservicios (backend)

Crear la siguiente estructura de carpetas en la raíz del proyecto:

```
backend/
  gateway/
    gateway.config.yml
    package.json
  auth-service/
    src/
      controllers/
        auth.controller.js
        biometric.controller.js
        admin.controller.js
      services/
        auth.service.js
        email.service.js
        biometric.service.js
      middleware/
        verifyToken.js
        verifyAdmin.js
      routes/
        auth.routes.js
        biometric.routes.js
        admin.routes.js
      db/
        supabase.js
    .env.example
    package.json
    server.js
```

### Tarea 1.3 — Conexión a Supabase

Crear `backend/auth-service/src/db/supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,     // 🔑 PON TU URL EN .env
  process.env.SUPABASE_SERVICE_KEY  // 🔑 PON TU SERVICE_ROLE KEY EN .env
);

module.exports = supabase;
```

Crear `.env.example` para auth-service:
```
PORT=3001
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=tu_service_role_key
JWT_SECRET=un_secret_largo_y_seguro
BREVO_API_KEY=tu_brevo_api_key
FRONTEND_URL=http://localhost:4200
```

### Tarea 1.4 — API Gateway

Instalar Express Gateway:
```bash
cd backend/gateway
npm init -y
npm install express-gateway
```

Configurar `gateway.config.yml` con las rutas:
```yaml
http:
  port: 8000
apiEndpoints:
  auth:
    host: '*'
    paths: ['/api/auth/*']
  fighters:
    host: '*'
    paths: ['/api/fighters/*']
  events:
    host: '*'
    paths: ['/api/events/*']
  news:
    host: '*'
    paths: ['/api/news/*']
  predictions:
    host: '*'
    paths: ['/api/predictions/*']
serviceEndpoints:
  authService:
    url: 'http://localhost:3001'
  fightersService:
    url: 'http://localhost:3002'
  eventsService:
    url: 'http://localhost:3003'
  newsService:
    url: 'http://localhost:3004'
  predictionsService:
    url: 'http://localhost:3005'
pipelines:
  authPipeline:
    apiEndpoints: [auth]
    policies:
      - proxy:
          - action:
              serviceEndpoint: authService
              changeOrigin: true
  fightersPipeline:
    apiEndpoints: [fighters]
    policies:
      - proxy:
          - action:
              serviceEndpoint: fightersService
              changeOrigin: true
  eventsPipeline:
    apiEndpoints: [events]
    policies:
      - proxy:
          - action:
              serviceEndpoint: eventsService
              changeOrigin: true
  newsPipeline:
    apiEndpoints: [news]
    policies:
      - proxy:
          - action:
              serviceEndpoint: newsService
              changeOrigin: true
  predictionsPipeline:
    apiEndpoints: [predictions]
    policies:
      - proxy:
          - action:
              serviceEndpoint: predictionsService
              changeOrigin: true
```

### Tarea 1.5 — Auth Service completo

Instalar dependencias:
```bash
cd backend/auth-service
npm init -y
npm install express @supabase/supabase-js bcryptjs jsonwebtoken dotenv cors
npm install @simplewebauthn/server
npm install --save-dev nodemon
```

Implementar los siguientes endpoints:

**Auth routes** (`/api/auth`):
- `POST /api/auth/register` — registro, crea usuario con status=0, envía email via Brevo
- `GET /api/auth/verify-email?token=xxx` — confirma email, cambia status=1
- `POST /api/auth/login` — login con email/password, verifica status=1, devuelve JWT
- `POST /api/auth/resend-verification` — reenvía correo de verificación

**Biometric routes** (`/api/auth/biometric`):
- `GET /api/auth/biometric/register-challenge` — genera challenge para registrar huella (requiere JWT)
- `POST /api/auth/biometric/register` — guarda credential en biometric_credentials (requiere JWT)
- `GET /api/auth/biometric/login-challenge` — genera challenge para login con huella
- `POST /api/auth/biometric/login` — verifica firma y devuelve JWT si status=1

**Admin routes** (`/api/auth/admin`):
- `GET /api/auth/admin/users` — lista todos los usuarios (requiere JWT con role=admin)
- `PATCH /api/auth/admin/users/:id/status` — cambia status 0/1 (requiere JWT con role=admin)
- `PATCH /api/auth/admin/users/:id/role` — cambia role user/admin (requiere JWT con role=admin)
- `DELETE /api/auth/admin/users/:id` — elimina usuario (requiere JWT con role=admin)

### Tarea 1.6 — Middleware de autenticación

Crear `backend/auth-service/src/middleware/verifyToken.js`:
- Extrae el JWT del header `Authorization: Bearer TOKEN`
- Verifica con `jwt.verify`
- Agrega `req.user` con el payload decodificado
- Si inválido o expirado: responde 401

Crear `backend/auth-service/src/middleware/verifyAdmin.js`:
- Usa `verifyToken` primero
- Verifica que `req.user.role === 'admin'`
- Si no: responde 403

### Tarea 1.7 — Email service con Brevo

Crear `backend/auth-service/src/services/email.service.js`:
- Función `sendVerificationEmail(toEmail, toName, verificationLink)`
- Función `sendPasswordResetEmail(toEmail, toName, resetLink)` (para futuro)
- Usar `fetch` o `axios` a `https://api.brevo.com/v3/smtp/email`
- Header: `api-key: process.env.BREVO_API_KEY`
- Agregar comentario claro: `// 🔑 AGREGA TU BREVO_API_KEY EN EL ARCHIVO .env`

### Tarea 1.8 — Angular: modelos e interceptor

Crear modelos TypeScript en `src/app/models/`:
```bash
# Crear archivos:
src/app/models/user.model.ts
src/app/models/fighter.model.ts
src/app/models/event.model.ts
src/app/models/fight.model.ts
src/app/models/news.model.ts
src/app/models/prediction.model.ts
```

Crear interceptor:
```bash
ng g interceptor interceptors/auth
```
El interceptor debe:
- Leer el JWT de `localStorage`
- Adjuntarlo en el header `Authorization: Bearer TOKEN` de cada request HTTP
- Manejar errores 401 (redirigir al login)

Crear guard de autenticación:
```bash
ng g g guards/auth
ng g g guards/admin
```
- `auth.guard`: verifica que haya JWT válido, si no redirige a `/login`
- `admin.guard`: verifica que `role === 'admin'`, si no redirige a `/`

### Tarea 1.9 — Angular: Auth Service y páginas de login/registro

Crear servicio:
```bash
ng g s services/auth
```

Implementar en `auth.service.ts`:
- `register(data)` → POST `/api/auth/register`
- `login(email, password)` → POST `/api/auth/login`
- `logout()` → limpia localStorage
- `isLoggedIn()` → verifica JWT
- `getCurrentUser()` → decodifica JWT
- `registerBiometric()` → flujo WebAuthn registro
- `loginWithBiometric()` → flujo WebAuthn login

Crear páginas:
```bash
ng g c pages/login
ng g c pages/register
```

Implementar con PrimeNG:
- `login`: formulario email/password + botón "Iniciar con huella dactilar" (solo visible si el usuario ya registró huella)
- `register`: formulario nombre/email/password + confirmación password
- Validaciones reactivas con `ReactiveFormsModule`
- Mensajes de error con `p-message` de PrimeNG
- Botones con `p-button` de PrimeNG

---

## PARTE 2 — FIGHTERS SERVICE + EVENTS SERVICE

> Iniciar solo cuando la Parte 1 esté completada y funcionando. Verificar que auth-service responde correctamente antes de continuar.

### Tarea 2.1 — Fighters Service

Estructura:
```
backend/fighters-service/
  src/
    controllers/fighters.controller.js
    routes/fighters.routes.js
    db/supabase.js
  .env.example
  package.json
  server.js
```

Puerto: `3002`

Dependencias:
```bash
npm install express @supabase/supabase-js dotenv cors
```

Endpoints:
- `GET /api/fighters` — lista paginada de peleadores (query params: `page`, `limit`, `weight_class`, `search`)
- `GET /api/fighters/:id` — ficha completa de un peleador
- `POST /api/fighters` — crear peleador (requiere JWT admin via Gateway)
- `PUT /api/fighters/:id` — editar peleador (requiere JWT admin)
- `DELETE /api/fighters/:id` — eliminar peleador (requiere JWT admin)

### Tarea 2.2 — Events Service

Estructura:
```
backend/events-service/
  src/
    controllers/
      events.controller.js
      fights.controller.js
      stats.controller.js
    routes/
      events.routes.js
      fights.routes.js
      stats.routes.js
    db/supabase.js
  .env.example
  package.json
  server.js
```

Puerto: `3003`

Endpoints de eventos:
- `GET /api/events` — lista de eventos (query: `status`, `page`, `limit`)
- `GET /api/events/:id` — detalle de evento con sus peleas
- `POST /api/events` — crear evento (admin)
- `PUT /api/events/:id` — editar evento (admin)
- `DELETE /api/events/:id` — eliminar evento (admin)

Endpoints de peleas:
- `GET /api/events/:id/fights` — peleas de un evento
- `POST /api/events/:id/fights` — agregar pelea a evento (admin)
- `PUT /api/fights/:id` — editar pelea (admin)
- `DELETE /api/fights/:id` — eliminar pelea (admin)

Endpoints de estadísticas:
- `GET /api/fights/:id/stats` — estadísticas de una pelea
- `POST /api/fights/:id/stats` — cargar estadísticas (admin)
- `PUT /api/fights/:id/stats/:fighterId` — editar estadísticas (admin)

### Tarea 2.3 — Angular: páginas de peleadores y eventos

Crear servicios:
```bash
ng g s services/fighters
ng g s services/events
```

Crear páginas:
```bash
ng g c pages/fighters
ng g c pages/fighter-detail
ng g c pages/calendar
ng g c pages/event-detail
```

**Fighters page** (`/enciclopedia`):
- Grid de tarjetas de peleadores con PrimeNG `p-card`
- Filtro por división/peso con `p-dropdown`
- Buscador con `p-inputText`
- Paginación con `p-paginator`

**Fighter detail** (`/enciclopedia/:id`):
- Foto, nombre, apodo, nacionalidad
- Récord: wins/losses/draws con breakdown KO/Sub/Dec
- Tabla de estadísticas con `p-table` de PrimeNG
- Alcance, estatura, estilo de pelea

**Calendar page** (`/calendario`):
- Lista de eventos próximos agrupados por mes
- Cards de evento con fecha, sede, cartel principal
- Filtro por status (upcoming / completed)

**Event detail** (`/calendario/:id`):
- Header con poster, nombre y fecha del evento
- Tabla de peleas (Main Card y Preliminares) con `p-table`
- Face-to-face entre peleadores (La Pizarra Técnica)
- Stats de cada pelea si están disponibles

---

## PARTE 3 — NEWS SERVICE + PREDICTIONS SERVICE

> Iniciar solo cuando la Parte 2 esté completada. Verificar que fighters-service y events-service responden correctamente antes de continuar.

### Tarea 3.1 — News Service

Estructura:
```
backend/news-service/
  src/
    controllers/news.controller.js
    routes/news.routes.js
    db/supabase.js
  .env.example
  package.json
  server.js
```

Puerto: `3004`

Endpoints:
- `GET /api/news` — lista de noticias publicadas (query: `category`, `page`, `limit`)
- `GET /api/news/:slug` — artículo por slug
- `GET /api/news/latest` — últimas 3 noticias (para el slider del home)
- `POST /api/news` — crear artículo (admin)
- `PUT /api/news/:id` — editar artículo (admin)
- `PATCH /api/news/:id/status` — cambiar status draft/published/archived (admin)
- `DELETE /api/news/:id` — eliminar artículo (admin)

### Tarea 3.2 — Predictions Service

Estructura:
```
backend/predictions-service/
  src/
    controllers/
      predictions.controller.js
      votes.controller.js
    routes/
      predictions.routes.js
      votes.routes.js
    db/supabase.js
  .env.example
  package.json
  server.js
```

Puerto: `3005`

Endpoints de predicciones:
- `GET /api/predictions` — lista de predicciones activas
- `GET /api/predictions/:id` — detalle con resultados de votación
- `POST /api/predictions` — crear predicción (admin)
- `PATCH /api/predictions/:id/close` — cerrar votación (admin)
- `DELETE /api/predictions/:id` — eliminar (admin)

Endpoints de votos:
- `POST /api/predictions/:id/vote` — registrar voto (una vez por session_id)
- `GET /api/predictions/:id/results` — resultados en porcentajes

### Tarea 3.3 — Angular: páginas de noticias y predicciones

Crear servicios:
```bash
ng g s services/news
ng g s services/predictions
```

Crear páginas:
```bash
ng g c pages/news
ng g c pages/news-detail
ng g c pages/octagon
ng g c pages/predictions
```

**News page** (`/noticias`):
- Grid de artículos con `p-card`
- Filtro por categoría con `p-tabView` o `p-chips`
- Paginación con `p-paginator`

**News detail** (`/noticias/:slug`):
- Imagen de portada full-width
- Título, autor, fecha
- Contenido del artículo
- Artículos relacionados al final

**Octagon page** (`/octágono`):
- Lista de reseñas de eventos pasados
- Filtra noticias por `category = 'octágono'`

**Predictions page** (`/predicciones`):
- Cards de encuestas activas con `p-card`
- Botones de voto con `p-button`
- Gráfico de resultados con `p-chart` (PrimeNG) — barras horizontales mostrando % por peleador
- Una vez votado: muestra los resultados en tiempo real
- Encuestas cerradas muestran resultado final con el % que acertó

---

## PARTE 4 — FRONTEND ANGULAR COMPLETO

> Iniciar solo cuando las Partes 1, 2 y 3 estén completadas. Esta parte integra todo el frontend.

### Tarea 4.1 — Layout principal

Crear componentes de layout:
```bash
ng g c layouts/header
ng g c layouts/footer
ng g c layouts/main-layout
```

**Header** (`layouts/header`):
- Logo "Octágono Central" a la izquierda
- Menú de navegación horizontal con `p-menubar` de PrimeNG
- Ítems del menú: Inicio | Noticias | El Octágono | Calendario | Enciclopedia | Predicciones
- Lado derecho:
  - Si NO logueado: botones "Iniciar sesión" y "Registrarse"
  - Si logueado: avatar con `p-avatar` + dropdown con "Mi perfil" y "Cerrar sesión"
  - Si logueado y `role=admin`: ítem adicional "Panel Admin" en el dropdown

**Footer** (`layouts/footer`):
- Logo y descripción corta
- Links de navegación
- Ícono de redes sociales
- Copyright

**Main Layout** (`layouts/main-layout`):
- Wrapper que incluye header + `<router-outlet>` + footer
- Se aplica a todas las rutas excepto admin

### Tarea 4.2 — Home page

```bash
ng g c pages/home
```

Secciones:
1. **Hero Slider** — últimas 3 noticias/peleas con `p-carousel` de PrimeNG. Imagen de fondo, título y botón "Leer más"
2. **Próximo evento** — card del siguiente evento con cartel de peleas principales
3. **Últimas noticias** — grid de 6 noticias recientes con `p-card`
4. **Predicción destacada** — la encuesta activa más reciente con botones de voto

### Tarea 4.3 — Perfil de usuario

```bash
ng g c pages/profile
```

Secciones:
- Datos personales (nombre, email, avatar) — editable
- Cambiar contraseña
- **Sección biometría**:
  - Si NO tiene huella registrada: botón "Registrar huella dactilar"
  - Si tiene huella registrada: muestra el dispositivo y opción "Eliminar huella"
  - Integrar con `@simplewebauthn/browser`

### Tarea 4.4 — Panel de administración

```bash
ng g c pages/admin
ng g c pages/admin/admin-users
ng g c pages/admin/admin-news
ng g c pages/admin/admin-fighters
ng g c pages/admin/admin-events
ng g c pages/admin/admin-predictions
```

Proteger todas las rutas de admin con `admin.guard`.

**Admin Users** (`/admin/usuarios`):
- Tabla con `p-table` de todos los usuarios
- Columnas: nombre, email, rol, status, fecha registro
- Acciones por fila:
  - Toggle status 0/1 con `p-inputSwitch`
  - Cambiar rol con `p-dropdown`
  - Eliminar con confirmación `p-confirmDialog`

**Admin News** (`/admin/noticias`):
- Lista de artículos con status (draft/published/archived)
- Botón "Nuevo artículo" abre formulario
- Editor de contenido con `p-editor` de PrimeNG
- Campos: título, slug (auto-generado del título), categoría, imagen de portada, contenido, status

**Admin Fighters** (`/admin/peleadores`):
- Tabla de peleadores con búsqueda
- CRUD completo con formulario en `p-dialog`

**Admin Events** (`/admin/eventos`):
- Lista de eventos con status
- Crear/editar evento con `p-dialog`
- Dentro del detalle de evento: gestionar peleas de la cartelera
- Cargar estadísticas de pelea

**Admin Predictions** (`/admin/predicciones`):
- Lista de predicciones con estado activo/cerrado
- Crear predicción asociada a una pelea
- Botón para cerrar votación manualmente

### Tarea 4.5 — Routing y guards

Configurar `app.routes.ts`:

```typescript
export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'noticias', component: NewsComponent },
      { path: 'noticias/:slug', component: NewsDetailComponent },
      { path: 'octágono', component: OctagonComponent },
      { path: 'calendario', component: CalendarComponent },
      { path: 'calendario/:id', component: EventDetailComponent },
      { path: 'enciclopedia', component: FightersComponent },
      { path: 'enciclopedia/:id', component: FighterDetailComponent },
      { path: 'predicciones', component: PredictionsComponent },
      { path: 'perfil', component: ProfileComponent, canActivate: [authGuard] },
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    children: [
      { path: 'usuarios', component: AdminUsersComponent },
      { path: 'noticias', component: AdminNewsComponent },
      { path: 'peleadores', component: AdminFightersComponent },
      { path: 'eventos', component: AdminEventsComponent },
      { path: 'predicciones', component: AdminPredictionsComponent },
    ]
  },
  { path: '**', component: NotFoundComponent }
];
```

### Tarea 4.6 — PrimeNG setup

Instalar PrimeNG:
```bash
npm install primeng @primeng/themes primeicons
```

Configurar en `app.config.ts`:
```typescript
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: { darkModeSelector: '.dark-mode' }
      }
    })
  ]
};
```

Agregar en `styles.scss`:
```scss
@import "primeicons/primeicons.css";
```

### Tarea 4.7 — Página 404

```bash
ng g c pages/not-found
```

Página simple con mensaje "Página no encontrada" y botón para volver al inicio.

---

## NOTAS IMPORTANTES PARA EL AGENTE

1. **No recrear la BD** — el schema ya está ejecutado en Supabase. Solo conectarse y usar las tablas.

2. **Variables de entorno** — NUNCA hardcodear keys. Siempre usar `.env` y dejar comentarios con `// 🔑 PON TU KEY EN .env` donde se necesite configurar.

3. **Brevo API Key** — el usuario ya la tiene. El agente debe crear la función y dejar el placeholder en el `.env.example` con el comentario indicado.

4. **Carpetas Angular** — verificar si existen antes de crear. Si no existen, crearlas. Nunca asumir.

5. **Comandos ng** — SIEMPRE usar `ng g c pages/NOMBRE` para páginas y `ng g c components/NOMBRE` para componentes reutilizables.

6. **Partes independientes** — cada parte puede ejecutarse de forma independiente si se acaban los créditos. Al retomar, leer este documento completo antes de continuar.

7. **Orden obligatorio** — no saltar partes. La Parte 2 depende de que el auth-service de la Parte 1 funcione. La Parte 4 depende de que todos los microservicios estén activos.

8. **PrimeNG** — usar componentes de PrimeNG para TODO el UI. No crear estilos custom innecesarios. Tailwind solo para layout (márgenes, paddings, grid).

9. **Repositorio** — el proyecto ya tiene repositorio en GitHub: `https://github.com/YOOUYII/octagono-central`

---

## RESUMEN DE PUERTOS

| Servicio | Puerto |
|---|---|
| Angular (dev) | 4200 |
| Express Gateway | 8000 |
| auth-service | 3001 |
| fighters-service | 3002 |
| events-service | 3003 |
| news-service | 3004 |
| predictions-service | 3005 |

---

*Plan v1.0 — Octágono Central*
