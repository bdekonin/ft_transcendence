# FROM nginx

# COPY ./frontend/build /usr/share/nginx/html
# COPY ./frontend/package.json /usr/share/nginx/.
# WORKDIR /usr/share/nginx/html
FROM node:13.12.0-alpine as build

WORKDIR /app

ENV PATH ./node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --silent
RUN npm install react-scripts@3.4.1 -g --silent
COPY . ./
RUN npm run build

# Production build
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/.
CMD ["nginx", "-g", "daemon off;"]
