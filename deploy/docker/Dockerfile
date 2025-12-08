# ============================================
# Review Terminal - Production Dockerfile
# Multi-stage build for minimal image size
# ============================================

# ============================================
# Stage 1: PNPM Base
# Purpose: Install PNPM package manager
# ============================================
FROM node:20-alpine AS pnpm-base

# Enable corepack and install PNPM
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

# ============================================
# Stage 2: Dependencies
# Purpose: Install all dependencies
# ============================================
FROM pnpm-base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: Build Frontend
# Purpose: Compile TypeScript and bundle with Vite
# ============================================
FROM deps AS build

# Build-time environment variables (baked into frontend bundle)
ARG VITE_API_BASE=/
ARG VITE_GHE_BASE_URL=https://github.com
ARG VITE_AUTH_CALLBACK_PATH=/auth/callback
ARG VITE_AUTH_ENABLED=true

ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_GHE_BASE_URL=${VITE_GHE_BASE_URL}
ENV VITE_AUTH_CALLBACK_PATH=${VITE_AUTH_CALLBACK_PATH}
ENV VITE_AUTH_ENABLED=${VITE_AUTH_ENABLED}

# Copy TypeScript configuration
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./

# Copy Vite configuration
COPY vite.config.ts ./

# Copy source files
COPY index.html ./
COPY src ./src
COPY public ./public

# Build frontend
RUN pnpm build && \
    echo "Frontend build complete. Dist size:" && \
    du -sh dist

# ============================================
# Stage 4: Production Runtime
# Purpose: Minimal runtime image with Node.js
# ============================================
FROM node:20-alpine AS production

# Install PNPM for production dependencies
RUN corepack enable && corepack prepare pnpm@10.24.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile && \
    # Remove PNPM store to reduce image size
    rm -rf /root/.local/share/pnpm

# Copy built frontend from build stage
COPY --from=build /app/dist ./dist

# Copy server files
COPY deploy/docker/productionServer.js ./server/productionServer.js

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Runtime configuration
ENV NODE_ENV=production
ENV PORT=8080

# Expose port 8080
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/healthz', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start production server
CMD ["node", "server/productionServer.js"]
