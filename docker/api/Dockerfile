FROM node:22.14.0

RUN apt-get update && apt-get install -y vim
RUN npm install -g pm2

WORKDIR /app

COPY ../../api /app

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["tail", "-f", "/dev/null"]