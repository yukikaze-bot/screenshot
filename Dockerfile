FROM zenika/alpine-chrome:with-node

WORKDIR /screenshot
USER root

COPY . .

RUN yarn && \
	yarn build && \
	apk add --no-cache tini

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "."]
