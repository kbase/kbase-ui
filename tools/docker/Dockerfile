FROM alpine:3.7 as builder

# add deps for building kbase-ui
RUN apk upgrade --update-cache --available \
    && apk add --update --no-cache \
        nodejs=8.9.3-r1 \
        nodejs-npm=8.9.3-r1 \
        git=2.15.2-r0 \
        make=4.2.1-r0 \
        bash=4.4.19-r1 \
        python=2.7.14-r2 \
        g++=6.4.0-r5 \
        chromium=61.0.3163.100-r0 \
    && mkdir -p /kb

COPY ./package.json /kb
WORKDIR /kb
RUN npm install

COPY . /kb

ARG BUILD

# This actually builds the ui codebase. Note that the build-arg BUILD is passed along
# as an environment variabl 'build'.
RUN make setup && make build config=$BUILD

# Run unit tests.
RUN make unit-tests

LABEL stage=intermediate


# For more transparent (modulo the "edge") image, use the base
# alpine image and add our dependencies
FROM alpine:edge

# add deps for building kbase-ui
RUN echo "http://dl-4.alpinelinux.org/alpine/edge/testing" >> /etc/apk/repositories \
    && apk upgrade --update-cache --available \
    && apk add --update --no-cache \
        nginx=1.14.0-r0 \
    && mkdir -p /kb

RUN cd /tmp && \
	wget https://github.com/kbase/dockerize/raw/master/dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
	tar xvzf dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    rm dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
	mv dockerize /usr/bin

# Or, image designed to serve up static KBase UI contents
# FROM kbase/nginx

# These ARGs values are passed in via the docker build command
ARG BUILD_DATE
ARG VCS_REF
ARG BRANCH=develop
ARG TAG

RUN mkdir -p /kb/deployment/services/kbase-ui

# Copy built code.
COPY  --from=builder /kb/build/dist/client /kb/deployment/services/kbase-ui/dist/

# Copy config templates
COPY  --from=builder /kb/deployment/config-templates /kb/deployment/conf/deployment_templates/

# The BUILD_DATE value seem to bust the docker cache when the timestamp changes, move to
# the end
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-url="https://github.com/kbase/kbase-ui.git" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.schema-version="1.0.0-rc1" \
      us.kbase.vcs-branch=$BRANCH  \
      us.kbase.vcs-tag=$TAG \
      maintainer="Steve Chan sychan@lbl.gov"

ENTRYPOINT [ "/usr/bin/dockerize" ]
CMD [ "-template", "/kb/deployment/conf/deployment_templates/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
      "-template", "/kb/deployment/conf/deployment_templates/config.json.tmpl:/kb/deployment/services/kbase-ui/dist/modules/deploy/config.json", \
      "nginx"]
