# --------------------------
# 1️⃣ Build Phase
# --------------------------
    FROM node:18-alpine AS build

    WORKDIR /app
    
    # Accept build argument for API URL
    ARG REACT_APP_API_BASE_URL=http://localhost:8000
    ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
    
    COPY package*.json ./
    RUN npm install
    
    COPY . .
    
    RUN npm run build
    
    # --------------------------
    # 2️⃣ Run Phase (Production Server)
    # --------------------------
    FROM nginx:alpine
    
    COPY --from=build /app/build /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    