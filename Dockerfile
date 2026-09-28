# Stage 1: Build
FROM node:24-alpine AS build

WORKDIR /app

# Dependencies zuerst kopieren (Layer-Caching)
COPY package.json package-lock.json ./
RUN npm ci

# Restlichen Quellcode kopieren und bauen
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:24-alpine AS production

WORKDIR /app

# Nur den Build-Output kopieren
COPY --from=build /app/.output .output

# Nuxt/Nitro lauscht standardmäßig auf Port 3000
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Nitro-Server starten
CMD ["node", ".output/server/index.mjs"]
