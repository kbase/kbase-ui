FROM alpine:latest
RUN apk add --no-cache 
# Container designed to serve up static KBase UI contents

# These ARGs values are passed in via the docker build command
ARG BUILD_DATE
ARG VCS_REF
ARG BRANCH=develop

# Shinto-cli is a jinja2 template cmd line tool
# Install perl dependencies. Force Moose and RPC::Any::Server::JSONRPC::PSGI installation
# as the perl interpreter updates have broken the library unit tests
RUN apk --update upgrade && \
    apk add ca-certificates nginx python py-pip openssl wget bash bash-completion && \
    update-ca-certificates && \
    pip install shinto-cli[yaml]

# Setup the base perl libs
RUN mkdir -p /kb/deployment/lib

COPY deployment /kb/deployment

# The BUILD_DATE value seem to bust the docker cache when the timestamp changes, move to
# the end
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-url="https://github.com/kbase/kbase-ui.git" \
      org.label-schema.vcs-ref=$VCS_REF \
      org.label-schema.schema-version="1.0.0-rc1" \
      us.kbase.vcs-branch=$BRANCH  \
      maintainer="Steve Chan sychan@lbl.gov"

EXPOSE 80
ENTRYPOINT [ "/kb/deployment/bin/entrypoint.sh" ]
