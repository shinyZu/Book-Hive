# Use Node.js base image
FROM node:20.11.1

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Expose the backend port
EXPOSE 4000

# # Start the Express.js server in dev
# CMD ["npm", "dev"]

# Start the Express.js server in production
CMD ["npm", "start"]
