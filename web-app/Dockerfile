FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY web ./web
ENV NODE_ENV=production
CMD ["node", "server/start.mjs"]
