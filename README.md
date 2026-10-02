Instalación

bash
git clone <url-del-repositorio>
cd <carpeta-del-proyecto>

cd server
npm install

cd ../client
npm install

Variables de entorno

En server/, copia el archivo de ejemplo:

bash
cd server
cp .env.example .env

Contenido de .env.example:

PORT=4000
SNAILPAY_DOWN=false
PORT: puerto en el que corre la API.
SNAILPAY_DOWN: si se pone en true, simula que SnailPay no está disponible para todas las solicitudes (ver sección de SnailPay más abajo).
Cómo ejecutar el proyecto

Se necesitan dos terminales abiertas al mismo tiempo, una para el backend y otra para el frontend.

Terminal 1 — Backend

bash
cd server
npm run dev

La API queda disponible en http://localhost:4000. Puedes verificar que está corriendo visitando http://localhost:4000/api/health, que debe responder {"ok":true}.

Terminal 2 — Frontend

bash
cd client
npm run dev

Vite mostrará una URL local, normalmente http://localhost:5173. El frontend tiene configurado un proxy hacia el backend, así que ambos deben estar corriendo al mismo tiempo para que la aplicación funcione por completo.

Cómo ejecutar las pruebas

Backend

bash
cd server
npm test

Cubre los distintos escenarios del servicio SnailPay (cobro exitoso, datos inválidos, tarjeta rechazada, error del sistema), la presencia de los campos requeridos en cada respuesta, y el manejo de JSON malformado.

Frontend

bash
cd client
npm test
