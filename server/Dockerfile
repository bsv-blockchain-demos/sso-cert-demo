FROM node:20-alpine

WORKDIR /app

# Copy package files from root
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy server source code and only the lib directory it needs
COPY server/ ./server/
COPY src/lib/ ./src/lib/

EXPOSE 8080

CMD ["npm", "run", "server"]