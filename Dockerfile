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

# Paketmanager werden zur Laufzeit nicht gebraucht -> entfernen (kleinere
# Angriffsfläche, keine CVEs aus dem mitgelieferten npm im Image-Scan)
RUN rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
      /usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn*

# Nur den Build-Output kopieren
COPY --from=build /app/.output .output

# Nuxt/Nitro lauscht standardmäßig auf Port 3000
ENV HOST=0.0.0.0
ENV PORT=3000
EXPOSE 3000

# Nicht als root laufen (User "node" ist im offiziellen Image enthalten)
USER node

# Nitro-Server starten
CMD ["node", ".output/server/index.mjs"]
