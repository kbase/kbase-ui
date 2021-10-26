FROM alpine:3.14

RUN apk upgrade --update-cache --available && \
    apk add --update --no-cache bash ca-certificates nginx && \
    mkdir -p /kb

WORKDIR /kb

# This version uses master; otherwise functionally equivalent other than style.
RUN version=v0.15.1 && \
    wget -O - https://github.com/powerman/dockerize/releases/download/${version}/dockerize-`uname -s`-`uname -m` | install /dev/stdin /usr/local/bin/dockerize
# RUN archive=dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
#     wget https://github.com/kbase/dockerize/raw/master/$archive && \
#     tar xvzf $archive && \
#     rm $archive && \
#     mv dockerize /usr/local/bin

# These ARGs values are passed in via the docker build command
ARG BUILD_DATE
ARG VCS_REF
ARG BRANCH=develop
ARG TAG

# The main thing -- the kbase-ui built code.
COPY build /kb/deployment/services/kbase-ui

# Config templates
COPY deployment/templates /kb/deployment/templates

# Deployment-time scripts
COPY deployment/scripts /kb/deployment/scripts

# Need to include the integration tests since otherwise we need a local build
# to pick them up.
# COPY --from=builder /kb/build/test /kb/deployment/services/kbase-ui/test

# The BUILD_DATE value seem to bust the docker cache when the timestamp changes, move to
# the end
LABEL org.label-schema.build-date=$BUILD_DATE \
    org.label-schema.vcs-url="https://github.com/kbase/kbase-ui.git" \
    org.label-schema.vcs-ref=$COMMIT \
    org.label-schema.schema-version="1.0.0-rc1" \
    us.kbase.vcs-branch=$BRANCH  \
    us.kbase.vcs-tag=$TAG \
    maintainer="Steve Chan sychan@lbl.gov"

# Run as a regular user, not root.
RUN addgroup --system kbmodule && \
    adduser --system --ingroup kbmodule kbmodule && \
    chown -R kbmodule:kbmodule /kb

ENTRYPOINT [ "dockerize" ]

CMD [  \
    "-template", "/kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
    "-template", "/kb/deployment/templates/config.json.tmpl:/kb/deployment/services/kbase-ui/config.json", \
    "bash", "/kb/deployment/scripts/start-server.bash" ]
