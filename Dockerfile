FROM node:17-alpine

ENV COMMAND_PREFIX=! BOT_TOKEN=missing

# Create app directory
WORKDIR /usr/src/app

# Move all files
COPY ./dist /usr/src/app/
COPY ./package.json /usr/src/app/
COPY ./package-lock.json /usr/src/app/
COPY ./node_modules /usr/src/app/node_modules

# Start bot
CMD [ "node", "main.js" ]
