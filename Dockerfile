# ─── Etapa 1: Construir el frontend con Vite ─────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Exponer las variables de Dokploy durante el build (Vite las necesita)
ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

ARG VITE_DASHBOARD_PASSWORD
ENV VITE_DASHBOARD_PASSWORD=$VITE_DASHBOARD_PASSWORD

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar fuentes y construir
COPY . .
RUN npm run build

# ─── Etapa 2: Solo Node.js con el servidor y el dist ─────────────────────────
FROM node:20-alpine

WORKDIR /app

# Solo dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar el build del frontend
COPY --from=builder /app/dist ./dist

# Copiar el servidor backend
COPY server.js ./

# Puerto expuesto (Dokploy lo mapea)
EXPOSE 80

# Iniciar el servidor Node (sirve API + archivos estáticos)
CMD ["node", "server.js"]
