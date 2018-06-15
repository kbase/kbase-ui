FROM alpine:3.7

# add deps
RUN echo "http://dl-4.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && apk upgrade --update-cache --available \
    && apk add --update --no-cache \
        dockerize

# copy files
COPY contents /kb

CMD [ "/bin/sh", "/kb/main.sh" ]