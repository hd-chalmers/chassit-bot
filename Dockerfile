FROM node:17-alpine

ENV COMMAND_PREFIX=! BOT_TOKEN=NjY4NDgxNTI3OTYwNjk4ODgw.XiR58A.ZzBQQsbkKMcuO3vBrLk0QE7a3jg

# Create app directory
WORKDIR /usr/src/app

# Move all files
COPY ./dist /usr/src/app/
COPY ./package.json /usr/src/app/
COPY ./package-lock.json /usr/src/app/
COPY ./node_modules /usr/src/app/node_modules

RUN mkdir "/usr/src/app/data"

# Start bot
CMD [ "node", "main.js" ]
