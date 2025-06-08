# --- Etapa 1: Build de Dependencias ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copia los archivos de manifiesto para aprovechar el cache de Docker
COPY package.json package-lock.json ./

# Instala las dependencias de producción (excluyendo devDependencies)
RUN npm ci --only=production

# --- Etapa 2: Imagen Final para Producción ---
FROM node:20-alpine

# Define el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia las dependencias instaladas de la etapa 'builder'
COPY --from=builder /app/node_modules ./node_modules

# Copia todo el código fuente de tu aplicación
COPY . .

# Expone el puerto en el que tu aplicación Node.js escucha
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "server/index.js"]
