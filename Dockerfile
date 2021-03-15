# This file is a template, and might need editing before it works on your project.
FROM node:14

ENV COMMAND_PREFIX=! DISCORD_TOKEN=missing

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY . /usr/src/app

CMD [ "npm", "start" ]
