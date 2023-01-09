FROM node:13.12.0-alpine as build


COPY ./ /usr/src/app/.

WORKDIR /usr/src/app
RUN npm install
RUN npm install webpack
RUN npm run build


# Production build
FROM node
WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist /usr/src/app/dist
COPY ./tsconfig.json /usr/src/app/.
COPY ./package.json /usr/src/app/.

RUN cd /usr/src/app/ && npm install bcrypt

CMD ["npm", "run", "start:prod"]
