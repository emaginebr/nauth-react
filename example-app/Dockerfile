# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:5004
ENV VITE_API_URL=$VITE_API_URL

# Configure npm for better reliability
RUN npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retry-mintimeout 100000 && \
    npm config set fetch-timeout 600000

# Copy package files
COPY package*.json ./

# Install dependencies with legacy peer deps to handle React version conflicts
# Use multiple retries and longer timeout for network issues
RUN npm ci --legacy-peer-deps --prefer-offline --no-audit || \
    npm ci --legacy-peer-deps --prefer-offline --no-audit || \
    npm ci --legacy-peer-deps --no-audit

# Copy source code
COPY . ./

# Build the application
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
