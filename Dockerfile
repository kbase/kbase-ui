FROM alpine:3.15

RUN apk upgrade --update-cache --available && \
    apk add --update --no-cache bash ca-certificates nginx bash && \
    mkdir -p /kb

WORKDIR /kb

# This version uses master; otherwise functionally equivalent other than style.
RUN version=v0.15.1 && \
    wget -O - https://github.com/powerman/dockerize/releases/download/${version}/dockerize-`uname -s`-`uname -m` | install /dev/stdin /usr/local/bin/dockerize

# These ARGs values are passed in via the docker build command
ARG BUILD_DATE
ARG VCS_REF
ARG BRANCH=develop
ARG TAG

# The main thing -- the kbase-ui built code.
COPY build/dist /kb/deployment/app

# Config templates
COPY deployment/templates /kb/deployment/templates

# Deployment-time scripts
COPY deployment/scripts /kb/deployment/scripts

# Need to include the integration tests since otherwise we need a local build
# to pick them up.
# COPY --from=builder /kb/build/test /kb/deployment/services/kbase-ui/test

# The BUILD_DATE value seem to bust the docker cache when the timestamp changes, move to
# the end
LABEL org.opencontainers.image.source=https://github.com/kbase/kbase-ui
LABEL org.label-schema.build-date=$BUILD_DATE
LABEL org.label-schema.vcs-url="https://github.com/kbase/kbase-ui"
LABEL org.label-schema.vcs-ref=$COMMIT
LABEL org.label-schema.schema-version="1.0.0-rc1"
LABEL us.kbase.vcs-branch=$BRANCH
LABEL us.kbase.vcs-tag=$TAG 
LABEL maintainer="Erik Pearson eapearson@lbl.gov"

# Run as a regular user, not root.
RUN addgroup --system kbmodule && \
    adduser --system --ingroup kbmodule kbmodule && \
    chown -R kbmodule:kbmodule /kb

ENTRYPOINT [ "dockerize" ]

CMD [  \
    "-template", "/kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
    "-template", "/kb/deployment/templates/config.json.tmpl:/kb/deployment/app/deploy/config.json", \
    "bash", "/kb/deployment/scripts/start-server.bash" ]
