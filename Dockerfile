# ==========================================
# Etapa 1: Construcción (Build)
# ==========================================
FROM node:20-alpine AS build

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Argumentos de construcción para Vite (Dokploy los pasará aquí)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_DASHBOARD_PASSWORD

# Convertir ARGs en ENVs para que el proceso de 'npm run build' los vea
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_DASHBOARD_PASSWORD=$VITE_DASHBOARD_PASSWORD

# Construir la aplicación
RUN npm run build

# ==========================================
# Etapa 2: Producción (Nginx)
# ==========================================
FROM nginx:stable-alpine

# Copiar el build desde la etapa anterior al directorio de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar nuestra configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
