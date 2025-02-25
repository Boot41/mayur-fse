FROM node:18-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install

# Copy application code
COPY . .

# Build the application (uncomment if you need to build)
# RUN pnpm build

# Expose Next.js default port
EXPOSE 3001

# Start the development server
CMD ["pnpm", "dev"]