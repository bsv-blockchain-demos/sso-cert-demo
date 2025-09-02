FROM node:20-alpine

WORKDIR /server

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8080

ENV NEXT_PUBLIC_SERVER_PUBLIC_KEY="02531f30cd97188c244657493ca42fadeeb0d53bec4feddaf5019aa5f2af84f6fd"
ENV NEXT_PUBLIC_CERTIFIER_URL="http://localhost:8080"
ENV NEXT_PUBLIC_EMAIL_DOMAIN_CHECK="@bsvassociation.org"

CMD ["npm", "server"]