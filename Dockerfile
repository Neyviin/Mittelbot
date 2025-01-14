FROM node:18.15.0

WORKDIR /app

COPY package.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 5000

CMD [ "nodemon", "bot/core/index.js" ]