# ==============================================================================
# BSofts-School Backend — Multi-Stage Production Dockerfile
# Node.js 22 LTS Alpine base for lightweight, secure container runtime
# ==============================================================================

# Stage 1: Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

# Install OpenSSL for Prisma engine compatibility on Alpine
RUN apk add --no-cache openssl libc6-compat

COPY package.json package-lock.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci || npm install --no-audit

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client & compile NestJS TypeScript
RUN npx prisma generate
RUN npm run build

# Prune dev dependencies for lean production container
RUN npm prune --production

# Stage 3: Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat wget && \
    mkdir -p /app/uploads /app/data && \
    chown -R node:node /app && \
    chmod -R 777 /app/uploads /app/data

ENV NODE_ENV=production
ENV PORT=3025

# Copy production artifacts
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node --from=builder /app/package.json ./package.json
COPY --chown=node:node --from=builder /app/data ./data

# Switch to non-root user
USER node

EXPOSE 3025

# Container Healthcheck using NestJS /api/health probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3025/api/health || exit 1

CMD ["node", "dist/main"]
