# ------------------------------
# The build image
# ------------------------------
FROM alpine:3.13 as builder

# add deps for building kbase-ui
RUN apk upgrade --update-cache --available && \
    apk add --update --no-cache bash chromium g++ git make nodejs npm python2 && \
    mkdir -p /kb

COPY ./package.json /kb
WORKDIR /kb
RUN npm install

COPY . /kb

ARG BUILD_CONFIG

# Build kbase-ui
RUN echo "Using build arg $BUILD_CONFIG"
RUN make build config="$BUILD_CONFIG"

LABEL stage=intermediate

# ------------------------------
# The product image
# ------------------------------
FROM alpine:3.13

RUN apk upgrade --update-cache --available && \
    apk add --update --no-cache bash ca-certificates nginx && \
    mkdir -p /kb

WORKDIR /kb

# This version uses master; otherwise functionally equivalent other than style.
RUN archive=dockerize-alpine-linux-amd64-v0.6.1.tar.gz && \
    wget https://github.com/kbase/dockerize/raw/master/$archive && \
    tar xvzf $archive && \
    rm $archive && \
    mv dockerize /usr/local/bin

# These ARGs values are passed in via the docker build command
ARG BUILD_DATE
ARG VCS_REF
ARG BRANCH=develop
ARG TAG

# The main thing -- the kbase-ui built code.
COPY --from=builder /kb/build/dist/client /kb/deployment/services/kbase-ui/dist/

# Config templates
COPY --from=builder /kb/deployment/templates /kb/deployment/templates

# Deployment-time scripts
COPY --from=builder /kb/deployment/scripts /kb/deployment/scripts

# Need to include the integration tests since otherwise we need a local build
# to pick them up.
COPY --from=builder /kb/build/test /kb/deployment/services/kbase-ui/test

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
    "-template", "/kb/deployment/templates/config.json.tmpl:/kb/deployment/services/kbase-ui/dist/modules/deploy/config.json", \
    "bash", "/kb/deployment/scripts/start-server.bash" ]
