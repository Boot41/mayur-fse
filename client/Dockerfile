# Build stage
FROM node:20-slim as build

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the React app
RUN npm run build

# Install the serve package globally to serve the build
RUN npm install -g serve

# Expose the port to make the app accessible
EXPOSE 3000

# Command to start the app
CMD ["serve", "-s", "dist", "-l", "3000"]