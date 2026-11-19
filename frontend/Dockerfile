# ---------- Stage 1: build the React app ----------
FROM node:22-alpine AS build

WORKDIR /app

# Copy package files first so Docker can cache the install step
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Stage 2: serve the built files with nginx ----------
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
