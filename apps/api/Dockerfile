FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/domain/package.json ./packages/domain/
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm --filter @tpomodoro/contracts build
RUN pnpm --filter @tpomodoro/domain build
RUN pnpm --filter @tpomodoro/api build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/domain/package.json ./packages/domain/
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=builder /app/packages/domain/dist ./packages/domain/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/drizzle ./apps/api/drizzle

EXPOSE 3000

CMD ["node", "apps/api/dist/src/main.js"]
