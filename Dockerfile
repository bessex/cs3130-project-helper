FROM node:16

WORKDIR /usr/src/app

# fix the time zone
RUN apt update && apt install tzdata -y
ENV TZ="America/Denver"

# install app dependencies
# use wildcard to copy both package.json & package-lock.json
COPY package*.json ./
RUN npm install

# copy app source
COPY ./src .

# copy dotenv example file
COPY .env.example ./

# start server with 'node -r dotenv-safe/config ./index.js'
# this allows us to use .env without it being in docker
CMD [ "node", "-r", "dotenv-safe/config", "./index.js" ]