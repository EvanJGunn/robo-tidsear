FROM node:16
WORKDIR /usr/src/app

COPY . ./

# Dont do this in prod but I am lazy lol


RUN npm install

CMD [ "node", "index.js" ]