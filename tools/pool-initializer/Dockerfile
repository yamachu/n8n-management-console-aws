FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@latest-10

WORKDIR /app

FROM base AS deps
RUN --mount=type=bind,source=package.json,target=/app/package.json,readonly \
    --mount=type=bind,source=pnpm-lock.yaml,target=/app/pnpm-lock.yaml,readonly \
    --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

FROM base
COPY . /app
COPY --from=deps /app/node_modules /app/node_modules
