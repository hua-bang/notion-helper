# 1. build stage
FROM node:18-alpine as builder

RUN npm install -g pnpm 

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm build

# 2. production stage
FROM node:18-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

RUN pnpm install --prod

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]