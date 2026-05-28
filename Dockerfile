# ==========================================
# Étape 1 : Builder (Compilation)
# ==========================================
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./

# On empêche l'exécution de Husky au build
RUN npm install --ignore-scripts

COPY src ./src
RUN npx tsc

# ==========================================
# Étape 2 : Production (Image finale légère)
# ==========================================
FROM node:24-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev --ignore-scripts

COPY --from=builder /app/dist ./dist
COPY public ./public

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

EXPOSE 3000

# SÉCURITÉ : On devient l'utilisateur restreint "node" APRÈS les installations
USER node

CMD ["node", "dist/server.js"]