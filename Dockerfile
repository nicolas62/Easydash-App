# Build stage runs on the native CI platform (amd64) regardless of target arch.
# Vite/TS output is pure JS — no need to compile on ARM via slow QEMU emulation.
ARG BUILDPLATFORM
FROM --platform=${BUILDPLATFORM} node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Runtime stage uses the actual target platform (amd64 / arm64 / arm/v7)
FROM node:22-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --legacy-peer-deps --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

EXPOSE 3000
CMD ["npm", "run", "start"]
