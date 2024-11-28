# Use Node.js base image
FROM node:16

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Expose a port if needed (not mandatory for bots, as they operate over Discord API)
# EXPOSE <optional-port>

# # Start the bot in dev environment
# CMD ["npm", "run", "dev"]

# Start the bot in production
CMD ["npm", "start"]
