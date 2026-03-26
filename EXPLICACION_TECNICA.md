# 🛠️ Explicación Técnica: Despliegue de Octágono Central

Este documento explica cómo funciona tu arquitectura de microservicios, qué causó el error **502 Bad Gateway** y cómo lo solucionamos para que todo funcione correctamente en Render.

---

## 🏗️ 1. Arquitectura: El Gateway es el "Cerebro"

Tu proyecto no es un solo servidor, sino un equipo de 6 servidores trabajando juntos:
1.  **5 Microservicios** (Auth, Fighters, News, Events, Predictions): Cada uno se encarga de una tarea específica y tiene su propia URL en Render.
2.  **1 API Gateway**: Es la puerta de entrada. El Frontend (Angular) solo habla con el Gateway. El Gateway decide a qué microservicio enviar cada petición.

**Flujo de una petición:**
`Angular` ➡️ `Gateway (/api/news)` ➡️ `Gateway hace "Proxy"` ➡️ `News Service`

---

## ❌ 2. El Problema: Error 502 Bad Gateway

El error **502** significa que un servidor (el balanceador de carga de Render) intentó hablar con tu aplicación (el Gateway), pero esta **no respondió** o se había **detenido**.

### ¿Por qué pasaba?
1.  **Crashes por Validación**: Express Gateway (el motor de tu gateway) es muy estricto. Si le pides que use una variable como `${AUTH_SERVICE_URL}` y esa variable está vacía o no tiene el formato de una URL (como `https://...`), el programa **explota y se apaga** inmediatamente.
2.  **Variables de Entorno**: En local usábamos archivos `.env`, pero en Render las variables se inyectan directamente. Si el Gateway no estaba configurado para leer correctamente estas variables o si faltaba una sola, el servidor no arrancaba.
3.  **Puertos en Render**: Render asigna un puerto dinámico. Si el Gateway intentaba forzar el puerto 8000 sin avisarle a Render, a veces la conexión fallaba.

---

## ✅ 3. La Solución: ¿Qué arreglamos?

Hicimos tres cambios tácticos para que el Gateway fuera "indestructible":

### A. Soporte para `dotenv`
Añadimos `require('dotenv').config()` al inicio de `server.js`. Esto asegura que el Gateway pueda leer variables tanto de un archivo `.env` (en local) como del panel de Render (en producción).

### B. Valores por Defecto (Resiliencia)
Cambiamos la configuración en `gateway.config.yml` para usar **fallbacks**:
```yaml
# Antes (Si la variable faltaba, el Gateway explotaba)
url: ${NEWS_SERVICE_URL}

# Después (Si falta, usa localhost por defecto y NO explota)
url: ${NEWS_SERVICE_URL:-http://localhost:3004}
```
Esto permite que el Gateway arranque siempre, dándonos tiempo de ver los logs y corregir las URLs sin que el servicio se caiga.

### C. Logs de Diagnóstico
Añadimos mensajes que se imprimen al arrancar:
```text
Microservices URLs registered:
- Fighters: https://octagono-fighters-service.onrender.com
...
```
Esto te permite entrar a los logs de Render y ver **exactamente** qué URLs está intentando usar el Gateway. Si ves un espacio al final o una URL mal escrita, lo detectas al instante.

---

## 🚀 4. Guía para Futuros Proyectos

Para que esto no te vuelva a pasar en otros despliegues, sigue estos consejos pro:

1.  **Cero Espacios**: En el panel de Render, asegúrate de que al pegar las URLs no se cuele ningún espacio al final. Un espacio puede hacer que `https://mi-link.com ` sea una URL inválida.
2.  **Usa `https://` siempre**: Los microservicios en Render requieren HTTPS para hablar entre ellos de forma segura.
3.  **Logs son tus amigos**: Si algo da 502, lo primero es ir a la pestaña **Logs** en Render. Si no hay logs de "petición recibida", es que el servidor se cayó al arrancar.
4.  **Health Checks**: Si un servicio dice "Live" en Render, es que respondió a un ping. Si aún así da 502, el problema suele estar en la **URL de destino** (el upstream).

---

¡Felicidades por tener tu plataforma de microservicios funcionando al 100%! 🥊🔥
