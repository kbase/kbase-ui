FROM alpine:3.14

# These ARGs values are passed in via the docker build command
#ARG BUILD_DATE
#ARG VCS_REF
#ARG BRANCH=develop
#ARG TAG

# used for processing the config file templates
RUN version=v0.15.1 && \
    wget -O - https://github.com/powerman/dockerize/releases/download/${version}/dockerize-`uname -s`-`uname -m` | install /dev/stdin /usr/local/bin/dockerize

RUN apk --update upgrade && \
    apk add --no-cache bash bash-completion ca-certificates nginx openssl && \
    mkdir -p /kb/deployment

COPY contents /kb/deployment

RUN bash /kb/deployment/maybe-install-self-signed-cert.sh

# The BUILD_DATE value seem to bust the docker cache when the timestamp changes, move to
# the end
#LABEL org.label-schema.vcs-url="https://github.com/kbase/kbase-ui.git" \
#    org.label-schema.vcs-ref=$VCS_REF \
#    org.label-schema.schema-version="1.0.0-rc1" \
#    us.kbase.vcs-branch=$BRANCH  \
#    us.kbase.vcs-tag=$TAG \
#    maintainer="Steve Chan sychan@lbl.gov"

ENTRYPOINT [ \
    "dockerize", \
    "-template",  "/kb/deployment/conf/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
    "-template", "/kb/deployment/conf/cors.conf.tmpl:/etc/nginx/cors.conf", \
    "nginx"]
