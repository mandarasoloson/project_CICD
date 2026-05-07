# ==========================================
# Étape 1 : Builder (Compilation)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

COPY src ./src
RUN npx tsc

# ==========================================
# Étape 2 : Production (Image finale légère)
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

USER node

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["node", "dist/server.js"]