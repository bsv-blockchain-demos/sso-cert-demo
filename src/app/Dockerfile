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

# Declare build arguments for environment variables needed during build
ARG SERVER_PRIVATE_KEY
ARG WALLET_STORAGE_URL
ARG CHAIN
ARG PORT
ARG REDIRECT_URI
ARG MONGODB_URI
ARG MONGODB_CLUSTER_NAME
ARG CERT_TYPE
ARG JWT_SECRET
ARG MICROSOFT_CLIENT_ID
ARG MICROSOFT_CLIENT_SECRET
ARG MICROSOFT_TENANT_ID
ARG NEXT_PUBLIC_SERVER_PUBLIC_KEY
ARG NEXT_PUBLIC_CERTIFIER_URL
ARG NEXT_PUBLIC_EMAIL_DOMAIN_CHECK

# Set environment variables for build
ENV NODE_ENV=production
ENV SERVER_PRIVATE_KEY=${SERVER_PRIVATE_KEY}
ENV WALLET_STORAGE_URL=${WALLET_STORAGE_URL}
ENV CHAIN=${CHAIN}
ENV PORT=${PORT}
ENV REDIRECT_URI=${REDIRECT_URI}
ENV MONGODB_URI=${MONGODB_URI}
ENV MONGODB_CLUSTER_NAME=${MONGODB_CLUSTER_NAME}
ENV CERT_TYPE=${CERT_TYPE}
ENV JWT_SECRET=${JWT_SECRET}
ENV MICROSOFT_CLIENT_ID=${MICROSOFT_CLIENT_ID}
ENV MICROSOFT_CLIENT_SECRET=${MICROSOFT_CLIENT_SECRET}
ENV MICROSOFT_TENANT_ID=${MICROSOFT_TENANT_ID}
ENV NEXT_PUBLIC_SERVER_PUBLIC_KEY=${NEXT_PUBLIC_SERVER_PUBLIC_KEY}
ENV NEXT_PUBLIC_CERTIFIER_URL=${NEXT_PUBLIC_CERTIFIER_URL}
ENV NEXT_PUBLIC_EMAIL_DOMAIN_CHECK=${NEXT_PUBLIC_EMAIL_DOMAIN_CHECK}

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

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

# Start the application
CMD ["node", "server.js"]