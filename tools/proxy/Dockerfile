FROM alpine:3.8
# Container designed to serve up static KBase UI contents

# These ARGs values are passed in via the docker build command
ARG BUILD_DATE
ARG VCS_REF
ARG BRANCH=develop
ARG TAG

# Python and friends installed to get jinja2-cli, a jinja2 template cmd line tool
# used for processing the config file templates
ENV DOCKERIZE_VERSION v0.6.1
RUN apk --update upgrade && \
    apk add --no-cache \
    ca-certificates=20171114-r3 \
    nginx=1.14.2-r0 \
    openssl=1.0.2q-r0 \
    bash=4.4.19-r1 \
    bash-completion=2.8-r0 && \
    update-ca-certificates && \
    mkdir -p /kb/deployment && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /kb/deployment/test.key -out /kb/deployment/test.crt -subj "/C=US/ST=California/L=Berkeley/O=LBNL/OU=KBase/CN=ci.kbase.us" && \
    wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz && \
    rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY contents /kb/deployment

# The BUILD_DATE value seem to bust the docker cache when the timestamp changes, move to
# the end
LABEL org.label-schema.vcs-url="https://github.com/kbase/kbase-ui.git" \
    org.label-schema.vcs-ref=$VCS_REF \
    org.label-schema.schema-version="1.0.0-rc1" \
    us.kbase.vcs-branch=$BRANCH  \
    us.kbase.vcs-tag=$TAG \
    maintainer="Steve Chan sychan@lbl.gov"

ENTRYPOINT [ \
    "dockerize", \
    "-template",  "/kb/deployment/conf/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
    "-template", "/kb/deployment/conf/cors.conf.tmpl:/etc/nginx/cors.conf", \
    "nginx"]
