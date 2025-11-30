# =====================================================
# 1 — Build the Vite frontend
# =====================================================
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy only frontend dependencies first (for caching)
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the frontend
COPY . .

# Build frontend output into /app/dist
RUN npm run build


# =====================================================
# 2 — Build Firebase Functions
# =====================================================
FROM node:18-alpine AS backend-build

WORKDIR /app/functions

# Copy only function dependencies first
COPY functions/package.json functions/package-lock.json ./
RUN npm install

# Copy the rest of the backend code
COPY functions/ .


# =====================================================
# 3 — Final Runtime Image
# =====================================================
FROM node:18-alpine

WORKDIR /app

# Copy built frontend into /app/dist
COPY --from=frontend-build /app/dist ./dist

# Copy built Firebase functions into /app/functions
COPY --from=backend-build /app/functions ./functions

# Install global Firebase tools for emulator-style serving
RUN npm install -g firebase-tools

# Expose port 8080 (we will configure this in Hyperlift)
EXPOSE 8080

# Start Firebase hosting + functions together
CMD ["firebase", "serve", "--only", "hosting,functions", "--port", "8080"]
