FROM node:24-bookworm-slim
WORKDIR /app
COPY package.json ./
COPY server ./server
COPY netlify/functions ./netlify/functions
COPY web ./web
COPY scripts/prepare-assets.mjs ./scripts/prepare-assets.mjs
RUN node scripts/prepare-assets.mjs
ENV NODE_ENV=production
CMD ["node", "server/start.mjs"]
