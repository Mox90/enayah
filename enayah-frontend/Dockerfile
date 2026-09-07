FROM node:20-alpine

WORKDIR /app

RUN npm install -g npm@11.6.0

COPY package*.json ./

RUN npm ci

COPY . .

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]