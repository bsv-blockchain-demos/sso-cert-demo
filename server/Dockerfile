FROM node:20-alpine

WORKDIR /server

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

CMD ["npm", "server"]