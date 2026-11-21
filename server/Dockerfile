# syntax=docker/dockerfile:1
# Build: docker build -t bravely-api ./server
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Production dependencies only. bcrypt ships prebuilt binaries for this image.
RUN npm ci --omit=dev

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json index.js ./
COPY src ./src
COPY migrations ./migrations
# Run as the unprivileged user that ships with the image.
USER node
EXPOSE 5000
HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "index.js"]
