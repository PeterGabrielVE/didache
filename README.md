# didache

App en React Native con **Expo** (SDK 57, TypeScript), dockerizada.

UI basada en [Argon React Native](https://www.creative-tim.com/product/argon-react-native) de Creative Tim (MIT, ver `assets/argon/LICENSE.md`): tema en `src/constants/theme.ts` y componentes en `src/components/`.

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
docker compose up --build --watch
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

- Hot reload: `--watch` (Compose Watch) copia al contenedor cada archivo que guardás. No se usa un bind mount porque en Windows el disco compartido no avisa de cambios en subcarpetas y Metro no los vería.
- Si agregás dependencias (`npx expo install <paquete>` en tu PC), el cambio en `package.json` reconstruye la imagen solo.
- Los builds nativos (APK/IPA) no se hacen en este contenedor: usá **EAS Build** (`npx eas build`).
