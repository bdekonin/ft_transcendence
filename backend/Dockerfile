FROM node:13.12.0-alpine


COPY ./ /usr/src/app/.

WORKDIR /usr/src/app
RUN npm install
RUN npm install webpack
RUN npm run build


CMD ["npm", "run", "start:prod"]
