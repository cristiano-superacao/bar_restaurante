# syntax=docker/dockerfile:1

FROM node:18-alpine AS build
WORKDIR /app/server

# Instala dependências somente do backend
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copia o código do backend
COPY server/. .

# Ambiente de produção
ENV NODE_ENV=production
ENV PORT=3000

# Expondo a porta
EXPOSE 3000

# Comando de inicialização
CMD ["npm", "start"]
