# AetherBridge Unified Deployment
# Google Cloud Run Optimized

# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 2: Build the Express/Prisma Backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Install dependencies and generate prisma client
RUN npm ci
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src/
RUN npx tsc

# Stage 3: Production Image
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev
COPY prisma ./prisma/
RUN npx prisma generate

# Copy built backend
COPY --from=backend-builder /app/dist ./dist

# Copy built frontend into the backend's static delivery folder
COPY --from=frontend-builder /app/frontend/dist ./frontend-dist

# Expose the port Google Cloud Run passes
EXPOSE 8080

# Run the unified stack
CMD ["node", "dist/server.js"]
