FROM node:20-alpine

WORKDIR /server

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build TypeScript for production
RUN npm run build:server

EXPOSE 8080

CMD ["npm", "run", "server"]