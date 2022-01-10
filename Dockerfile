FROM node:17-alpine

# Create app directory
WORKDIR /usr/src/app

# Move all files
COPY . /usr/src/app
RUN npm i --include=dev
RUN ls
RUN npm run build

# Start bot
CMD [ "node", "./dist/main.js" ]
