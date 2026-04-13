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
