FROM node:20-alpine

WORKDIR /app

# Copy package files from root
COPY package.json package-lock.json ./
RUN npm ci

# Copy server source code and only the lib directory it needs
COPY server/ ./server/
COPY src/lib/ ./src/lib/

# Build TypeScript for production
RUN npm run build:server

EXPOSE 8080

CMD ["npm", "run", "server"]