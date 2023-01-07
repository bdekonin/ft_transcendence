FROM node

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY ./dist /usr/src/app/dist
COPY ./tsconfig.json /usr/src/app/.
COPY ./package.json /usr/src/app/.
COPY ./node_modules /usr/src/app/node_modules

RUN cd /usr/src/app/ && npm install bcrypt

CMD ["npm", "run", "start:prod"]
