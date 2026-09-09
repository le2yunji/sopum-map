FROM node:20-alpine

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@10.28.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY backend/package.json ./backend/package.json
COPY packages/package.json ./packages/package.json

RUN pnpm install --frozen-lockfile

COPY backend ./backend
COPY packages ./packages

RUN pnpm --filter @sopum-map/shared build
RUN pnpm --filter backend build

WORKDIR /app/backend

EXPOSE 4000

CMD ["pnpm", "start"]