FROM nginx:alpine
COPY index.html /usr/share/nginx/html/index.html

FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3302

CMD ["node", "server.js"]