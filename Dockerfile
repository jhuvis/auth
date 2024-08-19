# Usar a imagem oficial do Node.js
FROM node:20.11.1-alpine

# Definir o diretório de trabalho
WORKDIR /app

# Copiar o package.json e o package-lock.json
COPY package*.json ./

# Instalar as dependências
RUN npm cache clean --force && npm install --legacy-peer-deps

# Copiar o restante do código da aplicação
COPY . .

# Gerar o Prisma Client
RUN npx prisma generate

# Expor a porta que a aplicação vai usar
EXPOSE 5000

# Comando para rodar a aplicação
CMD ["npm", "run", "start:migrate:prod"]
