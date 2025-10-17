# Use an official Node.js runtime as a parent image
FROM node:20-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application's source code
COPY dist ./dist

# Command to run the application
CMD [ "node", "dist/index.js" ]
