# syntax=docker/dockerfile:1.6

FROM node:20-alpine AS pnpm-base

RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
WORKDIR /app

FROM pnpm-base AS deps
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
#
# Vite env variables are resolved at build time.
# Provide them via `docker build --build-arg ...` so they can be baked into the bundle.
#
ARG VITE_API_BASE=/
ARG VITE_GHE_BASE_URL=https://github.com
ARG VITE_AUTH_CALLBACK_PATH=/auth/callback
ARG VITE_AUTH_ENABLED=true

ENV VITE_API_BASE=${VITE_API_BASE}
ENV VITE_GHE_BASE_URL=${VITE_GHE_BASE_URL}
ENV VITE_AUTH_CALLBACK_PATH=${VITE_AUTH_CALLBACK_PATH}
ENV VITE_AUTH_ENABLED=${VITE_AUTH_ENABLED}

#
# Optional: auto-load Vite env file from repo.
# Keep ONLY public `VITE_*` values in this file.
#
COPY .env.production ./.env.production

COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src
COPY public ./public
RUN pnpm build

FROM node:20-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@10.25.0 --activate
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml* ./
RUN pnpm install --prod --frozen-lockfile && rm -rf /root/.local/share/pnpm

COPY --from=build /app/dist ./dist
COPY server ./server

RUN addgroup -g 1001 -S nodejs \
  && adduser -S nodejs -u 1001 \
  && chown -R nodejs:nodejs /app
USER nodejs

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT || 8080) + '/healthz', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "server/productionServer.js"]
