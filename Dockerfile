# AetherBridge — Google Cloud Run Optimized
# Multi-stage build: React frontend + Express/Prisma backend

# ─── Stage 1: Build React Frontend ───────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --legacy-peer-deps
COPY frontend ./
RUN npm run build

# ─── Stage 2: Build Express/TypeScript Backend ────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY prisma ./prisma/
COPY tsconfig.json ./
COPY src ./src/
# Generate prisma client then compile TypeScript
RUN npx prisma generate
RUN npx tsc --skipLibCheck

# ─── Stage 3: Lean Production Image ──────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps
COPY prisma ./prisma/
RUN npx prisma generate

# Compiled backend from Stage 2
COPY --from=backend-builder /app/dist ./dist

# Built React frontend from Stage 1 — placed at /app/frontend-dist
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Cloud Run injects PORT env var — default to 8080
ENV PORT=8080
ENV NODE_ENV=production
# SQLite in-memory for Cloud Run (no cloud DB needed for hackathon demo)
ENV DATABASE_URL="file:/tmp/dev.db"

EXPOSE 8080

CMD ["node", "dist/server.js"]
