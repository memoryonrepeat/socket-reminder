FROM node:carbon

WORKDIR /srv/app

COPY package.json package-lock.json ./

RUN npm ci --production

COPY . /srv/app

EXPOSE 8081

CMD ["npm", "start"]
