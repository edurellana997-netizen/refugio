# Refugio · un lugar para dos

Una experiencia web 3D, privada e íntima para **dos personas**. Generas un enlace único, tu pareja entra desde cualquier dispositivo, cada quien personaliza un avatar y se reúnen en una terraza bajo las estrellas: voz en tiempo real, chat de texto, música ambiental, velas, flores, pétalos que caen y un cielo que se enciende cuando se acercan.

Construido con **React + Three.js (React Three Fiber) + WebRTC + Firebase**, listo para **Vercel**.

---

## ✨ Qué incluye

- **Enlace de invitación único** por sala (`?room=xxxx`), con botón de copiar y compartir nativo en móvil.
- **Avatares 3D personalizables**: color, aura, figura y un detalle (flor, coronita, estrella).
- **Entorno romántico**: terraza de madera, sofá, velas con luz parpadeante, jarrones con flores, luces colgantes, luna y estrellas fugaces.
- **Animaciones compartidas**: separarse, tomarse de las manos, abrazarse (con corazón), sentarse juntos y contemplar el cielo. Cuando uno las activa, ambos las ven.
- **Voz en tiempo real** peer-to-peer (WebRTC), con silenciar micrófono.
- **Chat de texto** privado en tiempo real.
- **Música ambiental** generada en el navegador (sin archivos con derechos de autor).
- **Partículas**: pétalos que caen y luciérnagas.
- **Responsive** (computadora y móvil) y respeta `prefers-reduced-motion`.
- **Privacidad**: cada sala es solo para dos; la voz viaja directo de un dispositivo al otro.

---

## 1. Requisitos

- Node.js 18+ y npm.
- Una cuenta de Firebase (gratis).

## 2. Configurar Firebase

1. Crea un proyecto en https://console.firebase.google.com
2. **Authentication → Sign-in method →** activa **Anónimo**.
3. **Firestore Database →** crea la base de datos (modo producción).
4. En **Project settings → Tus apps → Web**, copia las credenciales.
5. Copia `.env.example` a `.env` y pega tus valores:

```bash
cp .env.example .env
```

6. **Reglas de seguridad:** copia el contenido de `firestore.rules` en
   **Firestore → Reglas** y publica. Esto mantiene cada sala privada entre
   las dos personas.

## 3. Correr en local

```bash
npm install
npm run dev
```

Abre la URL que muestra Vite. Para probar entre dos: abre el enlace de
invitación en otra pestaña, otro navegador o tu teléfono (en la misma red usa
la URL de red que imprime Vite).

> La voz requiere **HTTPS** o `localhost`. En `localhost` funciona; en red local
> usa el túnel de Vite o despliega para probar voz entre dispositivos distintos.

## 4. Desplegar en Vercel

1. Sube el repo a GitHub.
2. En Vercel: **New Project → importa el repo**.
3. Framework: **Vite** (se detecta solo). Build: `npm run build`, salida: `dist`.
4. En **Settings → Environment Variables** agrega las mismas variables `VITE_FIREBASE_*` del `.env`.
5. Deploy. El archivo `vercel.json` ya maneja el enrutado de la SPA.

---

## Estructura

```
src/
  App.jsx                 Orquesta lobby ↔ sala y la autenticación anónima
  firebase.js             Inicialización de Firebase + auth
  lib/
    avatar.js             Opciones de personalización
    ambient.js            Música ambiental procedural (Tone.js)
  hooks/
    useRoom.js            Crear/unir sala, presencia, estado de interacción
    useWebRTC.js          Voz P2P con señalización por Firestore
    useChat.js            Chat de texto en tiempo real
  components/
    Lobby.jsx             Bienvenida + nombre + personalización
    AvatarPicker.jsx      Selector con vista previa
    Room.jsx              Une todo dentro de la experiencia
    Scene.jsx             Canvas R3F, luz cálida, muebles, postprocesado
    Avatar.jsx            Avatar 3D y sus poses
    HUD.jsx               Acciones, voz, música, invitación
    TextChat.jsx          Panel de chat
    environment/
      DynamicSky.jsx      Cielo, estrellas, luna, fugaces
      Terrace.jsx         Terraza, barandal, luces
      Candles.jsx         Velas parpadeantes
      Particles.jsx       Pétalos y luciérnagas
```

---

## Notas honestas sobre el alcance

- **Avatares estilizados.** Son figuras suaves de bajo poligonaje cuya emoción
  se lee por cercanía, poses y luz, no por un esqueleto detallado. Para avatares
  humanos completos con animaciones de cuerpo, el camino es integrar
  **Ready Player Me** (avatares glTF) + animaciones de **Mixamo** y reemplazar
  `Avatar.jsx`. La arquitectura de poses compartidas ya queda lista para eso.
- **WebRTC con STUN.** Usa servidores STUN públicos de Google. La mayoría de
  redes domésticas conectan bien; detrás de NAT estrictos o redes corporativas
  conviene añadir un **servidor TURN** (p. ej. Twilio, Metered o coturn propio)
  en `ICE_SERVERS` dentro de `useWebRTC.js`.
- **Música.** Es un pad ambiental generado en el navegador para no incluir
  audio con derechos de autor. Si quieres una pista propia, agrégala como
  `<audio loop>` con un archivo con licencia.
- **Firestore para señalización.** La voz se negocia por Firestore (oferta,
  respuesta y candidatos ICE). Para producción a gran escala, considera limpiar
  documentos de salas viejas con una Cloud Function programada.

Hecho para que dos personas se sientan juntas, aunque estén lejos. 💫
