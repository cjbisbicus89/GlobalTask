# 1. Usamos una imagen ligera de Node.js v22
FROM node:22-alpine

# 2. Creamos el directorio de trabajo
WORKDIR /app

# 3. Copiamos los archivos de dependencias primero para aprovechar el cache de Docker
COPY package*.json ./

# 4. Instalamos las dependencias
RUN npm install

# 5. Copiamos todo el código del proyecto
COPY . .

# 6. Generamos el cliente de Prisma (Fundamental para que el Worker conecte a la DB)
RUN npx prisma generate

# 7. Exponemos el puerto de la API
EXPOSE 3000

# 8. El comando por defecto (El docker-compose lo sobrescribirá para el Worker)
CMD ["npx", "tsx", "watch", "src/app.ts"]