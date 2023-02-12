# Base image
FROM node:14.15.0

# Create app directory
WORKDIR /app

ENV NODE_ENV=production

# Install app dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production

# Bundle app source
COPY . .
CMD [ "node", "server.js" ]
