# syntax=docker/dockerfile:1

# ---------- base: dependencias ----------
FROM node:24-bookworm-slim AS base
WORKDIR /app
ENV CI=1 \
    EXPO_NO_TELEMETRY=1
COPY package.json package-lock.json ./
RUN npm ci

# ---------- dev: Metro bundler / Expo Go ----------
FROM base AS dev
# @expo/ngrok solo es necesario para el modo --tunnel
RUN npm install -g @expo/ngrok@^4.1.0
COPY . .
# 8081 = Metro (Expo Go y web en desarrollo)
EXPOSE 8081
ENV CI=0
CMD ["npx", "expo", "start"]

# ---------- build: export web estático ----------
FROM base AS build
COPY . .
RUN npx expo export --platform web

# ---------- web: servir el build con nginx ----------
FROM nginx:1.29-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
