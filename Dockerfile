FROM zenika/alpine-chrome:with-node

WORKDIR /screenshot
USER root

COPY . .

RUN yarn && yarn build

COPY . .

CMD ["node", "."]
