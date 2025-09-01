# Imagen base
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

# CMD correcto en formato JSON
CMD ["npm", "run", "dev"]
