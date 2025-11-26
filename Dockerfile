# ============================================================================
# Stage 1: Dependencies - Cache layer for package installation
# ============================================================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install build dependencies in single layer
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files and Prisma schema (required for postinstall script)
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install dependencies with BuildKit cache mount for npm cache
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --prefer-offline --no-audit

# ============================================================================
# Stage 2: Builder - Application build
# ============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat python3 make g++

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files and Prisma schema (needed for postinstall)
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Copy application source (most frequently changing, placed last)
COPY . .

# Build application with BuildKit cache mount
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# ============================================================================
# Stage 3: Production Runtime - Minimal final image
# ============================================================================
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install only runtime dependencies (curl for healthcheck)
RUN apk add --no-cache curl

# Copy package files for production install
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Install production dependencies only
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --legacy-peer-deps --prefer-offline --no-audit && \
    npm cache clean --force

# Copy Prisma Client (generated during build)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Copy Next.js build output
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/next.config.* ./

# Set production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start Next.js production server
CMD ["npm", "start"]
