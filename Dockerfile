# from https://nodejs.org/en/docs/guides/nodejs-docker-webapp/
FROM node:16

# create app directory
WORKDIR /usr/src/app

# install app dependencies
# use wildcard to copy both package.json & package-lock.json
COPY package*.json ./
RUN npm install

# bundle app source
COPY ./src .

# copy dotenv file
COPY .env.example ./

# start server with 'node -r dotenv-safe/config ./index.js'
# this allows us to use .env without it being in docker
CMD [ "node", "-r", "dotenv-safe/config", "./index.js" ]