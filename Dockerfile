# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY app/back/package*.json ./app/back/
COPY app/front/package*.json ./app/front/

# Install dependencies
RUN npm install
RUN cd app/back && npm install
RUN cd app/front && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd app/front && npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy backend files
COPY app/back/package*.json ./
RUN npm install --only=production

# Copy backend source
COPY app/back/src ./src

# Copy built frontend
COPY --from=builder /app/app/front/dist ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
