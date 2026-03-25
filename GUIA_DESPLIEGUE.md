# Guía de Ejecución y Despliegue: Octágono Central

¡Bienvenido! Este documento te guiará paso a paso para configurar, ejecutar localmente y finalmente desplegar a la nube todo tu ecosistema de microservicios (Backend) y tu aplicación en Angular (Frontend).

---

## 💻 1. CÓMO CORRER EL PROYECTO LOCALMENTE

Tu proyecto tiene una arquitectura moderna basada en **Microservicios**. Esto significa que en lugar de un solo servidor gigante, tienes 6 pequeños servidores corriendo en paralelo.

### Paso 1.1: Configurar Variables de Entorno (.env)
Has visto que en cada carpeta de microservicio hay un archivo llamado `.env.example`. 
1. Crea una copia de cada `.env.example` y llámala `.env` (sin el `.example`).
2. Haz esto para las carpetas: `auth-service`, `fighters-service`, `events-service`, `news-service`, `predictions-service`.
3. Abre cada `.env` recién creado y rellena tus datos:
   - `SUPABASE_URL`: La URL de tu proyecto en Supabase (ej. `https://xxx.supabase.co`).
   - `SUPABASE_SERVICE_KEY`: Tu "service_role secret" (la llave secreta larga de Supabase). ¡OJO, NO uses la llave pública (anon)!
   - `JWT_SECRET`: Inventa una contraseña súper secreta y larga para desencriptar sesiones (ej. `mi_palabra_secreta_para_octagono_2026`). *Debe ser exactamente la misma en todos los microservicios*.
   - `BREVO_API_KEY`: Solo en el `auth-service`, pon tu API Key generada desde tu cuenta de Brevo.

### Paso 1.2: Instalar Dependencias
Debes abrir tu terminal (línea de comandos) e instalar las dependencias (librerías) de **cada** carpeta por separado:

```bash
# Frontend (Angular)
npm install

# Backend y Microservicios (Abre una terminal por carpeta)
cd backend/gateway         && npm install
cd ../auth-service         && npm install
cd ../fighters-service     && npm install
cd ../events-service       && npm install
cd ../news-service         && npm install
cd ../predictions-service  && npm install
```

### Paso 1.3: Iniciando la Plataforma Localmente
Necesitarás varias terminales abiertas (o simplemente dividir la terminal en Visual Studio Code) para levantar todo, ya que cada servicio ocupa un puerto:

1. **Microservicios (Puertos 3001 a 3005):**
   - Ve a `backend/auth-service` y ejecuta `npm start`
   - Ve a `backend/fighters-service` y ejecuta `npm start`
   - Haz lo mismo con los demás servicios.
2. **El API Gateway (Puerto 8000):**
   - Ve a `backend/gateway` y ejecuta `node server.js` (si no configuraste npm start).
3. **El Frontend / Angular (Puerto 4200):**
   - Ubicado en la raíz (`octagono-central`), ejecuta `ng serve`

¡Listo! Ve a `http://localhost:4200` en tu navegador y la aplicación estará conectada a Supabase mediante tus propios microservicios.

---

## 🚀 2. CÓMO SUBIR EL PROYECTO A PRODUCCIÓN

Al ser tu primera vez subiendo una arquitectura así, usaremos **GitHub** como puente, **Vercel** para el Frontend (es la mejor, gratis y súper rápida) y **Railway** para el Backend.

### Paso 2.1: Sube todo a GitHub
Asegúrate de que tus archivos `.env` (donde pusiste contraseñas) NO se suban subiendo un archivo `.gitignore`. Railway te permitirá añadir los `.env` manualmente por seguridad.

En tu consola, en la carpeta raíz (`octagono-central`):
```bash
git init
git add .
git commit -m "Mi primer release de Octagono Central"
git branch -M main
# Sustituye la URL abajo con la URL vacía de tu nuevo repo en GitHub:
git remote add origin https://github.com/tu-usuario/octagono-central.git
git push -u origin main
```

### Paso 2.2: Desplegar Frontend Angular en (Vercel)
Vercel es perfecto para Angular. 
1. Ve a [Vercel.com](https://vercel.com/) e inicia sesión con GitHub.
2. Haz clic en **Add New -> Project**.
3. Importa tu repositorio `octagono-central`.
4. Vercel detectará que es Angular automáticamente. Configura en *Build Command*: `npm run build` y en *Output Directory*: `dist/octagono-central/browser` (Nota: Angular 18+ usa la subcarpeta `/browser`).
5. Dale a **Deploy**. En 2 minutos tendrás una URL pública HTTPS para tu frontend (ej. `tu-dominio.vercel.app`).

### Paso 2.3: Desplegar Microservicios en (Railway)
Railway permite subir un "Monorepo" (un solo repositorio de GitHub que tiene múltiples carpetas dentro) asignando aplicaciones a cada ruta.

1. Entra a [Railway.app](https://railway.app/) y logueate con GitHub.
2. Haz clic en **New Project -> Deploy from un GitHub repo** y elige tu repo `octagono-central`.
3. Esto creará tu primer servicio (Por ejemplo, el `gateway`). 
4. **Configurar Directorio Raíz del Servicio**: En Railway, entra a este servicio -> Ve a la pestaña **Settings** -> Busca **"Root Directory"** y cámbialo a `/backend/gateway`.
5. **Configurar Inicio**: En settings de Start Command pon `npm start` o `node server.js`.
6. En la pestaña **Variables**, añade la variable de entorno `PORT=8000` (El puerto que usa el Gateway). Railway generará una URL pública para ti. Anótala.

> 📝 **Repetir para cada Microservicio:**
> Repite el proceso para `auth-service`, `events-service`, etc. Dentro del mismo panel de tu proyecto en Railway haz clic en la opción "+ New -> GitHub Repo" > Selecciona el mismo repositorio.
> Cambia el "Root Directory" de cada uno hacia su carpeta respectiva (ej. `/backend/auth-service` o `/backend/events-service`).
> Ve a la pestaña de Variables e ingresa tu `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, etc. que configuraste localmente.

### Paso 2.4: Actualizando la Conexión (El Gateway en Producción)
Cuando todos tus microservicios (auth, events, news...) estén corriendo en Railway, tendrán una url propia como `auth-app.up.railway.app`.

Abre el archivo `gateway.config.yml` en Github o en tu local y **cambia los links `http://localhost:300X`** por las nuevas URLs que te dio Railway para esos microservicios y actualiza Github haciendo otro *git push*.

A su vez, tu aplicación Angular (`services/*.ts`) dejará de pedir datos a `localhost:8000` y ahora le pedirá al Gateway de Railway, debes buscar la linea `private apiUrl = 'http://localhost:8000/api/...';` en Angular y cambiarla por la URL de producción. ¡Y listo!

---
*💡 Consejo Pro:* Cada vez que modifiques código y hagas un `git push` a la nube, tanto Vercel como Railway detectarán el cambio y reconstruirán el código solitos. Así es como la magia DevOps sucede.
