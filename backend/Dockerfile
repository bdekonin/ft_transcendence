FROM node

COPY ./dist /root/dist
COPY ./tsconfig.json /root/.
COPY ./package.json /root/.
COPY ./node_modules /root/node_modules

RUN cd /root/ && npm install bcrypt

CMD ["npm run --prefix /root start:prod"]
