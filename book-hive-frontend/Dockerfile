# Use Node.js base image for building the React app
FROM node:16 as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project to the container
COPY . .

# Build the React app
RUN npm run build

# # Use a lightweight web server to serve the built files
# FROM nginx:alpine

# # Copy built files from the build stage to the nginx web server
# COPY --from=build /app/build /usr/share/nginx/html

# Expose the frontend port
EXPOSE 3000

# # Start the nginx server
# CMD ["nginx", "-g", "daemon off;"]

# # Start the Frontend
CMD ["npm", "start"]
