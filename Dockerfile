FROM node:carbon

WORKDIR /sentry

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
VOLUME /sentry/config

CMD ["node", "app.js"]
