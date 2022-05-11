FROM node:17-alpine as Build

# Create app directory
WORKDIR /usr/src/app

# Move all files
COPY . /usr/src/app
RUN yarn install -D
RUN yarn run build

# Start bot
CMD [ "node", "./dist/main.js" ]
