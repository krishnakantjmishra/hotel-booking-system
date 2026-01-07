# --------------------------
# 1️⃣ Build Phase
# --------------------------
FROM node:20-alpine AS build

WORKDIR /app

# Accept build argument for API URL (optional – if unset the app will use same origin)
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (npm install will update lock file if needed)
RUN npm install

# Copy source code (this layer will be rebuilt when code changes)
COPY . .

# Build the app
RUN npm run build

# --------------------------
# 2️⃣ Run Phase (Production Server)
# --------------------------
FROM nginx:alpine

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]