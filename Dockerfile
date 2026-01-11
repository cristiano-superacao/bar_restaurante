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

# Instala curl para healthcheck
RUN apk add --no-cache curl

# Expondo a porta
EXPOSE 3000

# Healthcheck da aplicação
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
	CMD curl -fsS http://127.0.0.1:3000/api/health || exit 1

# Comando de inicialização
CMD ["npm", "start"]
