# This dockerfile will create an image useful for development
# What distinguishes an image as useful for development directly, or as a base
# for such an image, is that the nginx config expects to run on a hostname
# of one of our deployment environments, and it also proxies the host to
# kbase services, narrative, and dynamic service.
FROM alpine:latest
RUN apk add --no-cache
# Container designed to serve up static KBase UI contents

# These ARGs values are passed in via the docker build command
ARG BUILD_DATE
ARG VCS_REF
ARG BRANCH=develop
ARG TAG

# Python and friends installed to get jinja2-cli, a jinja2 template cmd line tool
# used for processing the config file templates
RUN apk --update upgrade && \
    apk add ca-certificates nginx python py-pip openssl wget bash bash-completion && \
    update-ca-certificates && \
    mkdir -p /kb/deployment && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /kb/deployment/test.key -out /kb/deployment/test.crt -subj "/C=US/ST=California/L=Berkeley/O=LBNL/OU=KBase/CN=ci.kbase.com"&& \
    pip install jinja2-cli[yaml]


RUN touch /kb/
    

COPY contents /kb/deployment

# The BUILD_DATE value seem to bust the docker cache when the timestamp changes, move to
# the end
LABEL org.label-schema.vcs-url="https://github.com/kbase/kbase-ui.git" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.schema-version="1.0.0-rc1" \
      us.kbase.vcs-branch=$BRANCH  \
      us.kbase.vcs-tag=$TAG \
      maintainer="Steve Chan sychan@lbl.gov"

EXPOSE 80
ENTRYPOINT [ "/kb/deployment/bin/entrypoint.sh" ]
