# Build stage
FROM node:20-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
ENV NEXT_PUBLIC_SERVER_PUBLIC_KEY="02531f30cd97188c244657493ca42fadeeb0d53bec4feddaf5019aa5f2af84f6fd"
ENV NEXT_PUBLIC_CERTIFIER_URL="http://localhost:8080"
ENV NEXT_PUBLIC_EMAIL_DOMAIN_CHECK="@bsvassociation.org"

# Start the application
CMD ["npm", "start"]