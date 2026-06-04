# Étape 1 : Dépendances
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm@10
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Étape 2 : Build
FROM node:20-alpine AS builder
RUN npm install -g pnpm@10
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm run build

# Étape 3 : Production (Classique)
FROM node:20-alpine AS runner
RUN npm install -g pnpm@10
WORKDIR /app
ENV NODE_ENV production

# Sécurité : on garde les bonnes pratiques
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# On copie tout ce qui est nécessaire pour un "pnpm start" classique
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000

# Lancement natif via pnpm
CMD ["pnpm", "start"]