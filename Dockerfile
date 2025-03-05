# Use Node.js LTS as base image
FROM node:22

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including nodemon)
RUN npm install

# Copy the entire application code
COPY . .

# Install nodemon globally
RUN npm install -g nodemon

# Expose the application port
EXPOSE 5000

# Set entrypoint script
ENTRYPOINT ["/bin/sh", "./entrypoint.sh"]
