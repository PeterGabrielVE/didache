# didache

App en React Native con **Expo** (SDK 57, TypeScript), dockerizada.

## Local (sin Docker)

```bash
npm install
npm start          # Metro + QR para Expo Go
npm run web        # versión web en el navegador
```

## Docker

1. Copiar `.env.example` a `.env.local` y poner la IP LAN de tu PC en `REACT_NATIVE_PACKAGER_HOSTNAME` (`ipconfig` → IPv4).
2. Levantar el entorno de desarrollo:

```bash
docker compose up --build
```

- **Móvil:** escaneá el QR con Expo Go (el teléfono tiene que estar en la misma red Wi-Fi).
- **Web:** http://localhost:8081
- ¿Otra red o hay firewall? Poné `EXPO_MODE=tunnel` en `.env.local` (usa ngrok).

Comandos interactivos de Expo (reload, menú, etc.):

```bash
docker compose attach app
```

### Build web de producción (nginx)

```bash
docker compose --profile prod up --build web   # http://localhost:8080
```

### Notas

- `node_modules` vive en un volumen de Docker. Si agregás dependencias: `docker compose run --rm app npx expo install <paquete>` y después `docker compose up --build`.
- En Windows, Docker no propaga los cambios de archivos al contenedor; `docker/watch-poll.js` los sondea cada 1 s (`WATCH_INTERVAL_MS`) para que el hot reload funcione. Para mejor rendimiento, clonar el repo dentro de WSL2.
- Los builds nativos (APK/IPA) no se hacen en este contenedor: usá **EAS Build** (`npx eas build`).
