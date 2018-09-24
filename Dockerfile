# ------------------------------
# The build image
# ------------------------------
FROM alpine:3.8 as builder

# add deps for building kbase-ui
RUN apk upgrade --update-cache --available \
    && apk add --update --no-cache \
        nodejs=8.11.4-r0 \
        npm=8.11.4-r0 \
        git=2.18.0-r0 \
        make=4.2.1-r2 \
        bash=4.4.19-r1 \
        g++=6.4.0-r8 \
        python2=2.7.15-r1 \
        chromium=68.0.3440.75-r0 \
    && mkdir -p /kb

COPY ./package.json /kb
WORKDIR /kb
RUN npm install

COPY . /kb

ARG BUILD

# This actually builds the ui codebase. Note that the build-arg BUILD is passed along
# as an environment variabl 'build'.
RUN make setup && make build config=$BUILD && make docs

# Run unit tests.
RUN make unit-tests

LABEL stage=intermediate

# ------------------------------
# The product image
# ------------------------------
FROM alpine:3.8

RUN apk upgrade --update-cache --available \
    && apk add --update --no-cache \
        bash=4.4.19-r1 \
        ca-certificates=20171114-r3 \
        nginx=1.14.0-r1 \        
    && mkdir -p /kb

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

# Config files for each deployment environment. 
# TODO: hopefully kbase/dockerize will be updated to pull configs from 
#       the deploy environment not the image itself.
COPY --from=builder /kb/deployment/config /kb/deployment/config

# Deployment-time scripts
COPY --from=builder /kb/deployment/scripts /kb/deployment/scripts

# Generated documentation is copied into the distribution.
COPY --from=builder /kb/docs/book/_book /kb/deployment/services/kbase-ui/dist/_book

# The BUILD_DATE value seem to bust the docker cache when the timestamp changes, move to
# the end
LABEL org.label-schema.build-date=$BUILD_DATE \
      org.label-schema.vcs-url="https://github.com/kbase/kbase-ui.git" \
      org.label-schema.vcs-ref=$COMMIT \
      org.label-schema.schema-version="1.0.0-rc1" \
      us.kbase.vcs-branch=$BRANCH  \
      us.kbase.vcs-tag=$TAG \ 
      maintainer="Steve Chan sychan@lbl.gov"

RUN addgroup --system kbmodule && \
    adduser --system --ingroup kbmodule kbmodule && \
	chown -R kbmodule:kbmodule /kb

ENTRYPOINT [ "dockerize" ]

CMD [  "-template", "/kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
       "-template", "/kb/deployment/templates/config.json.tmpl:/kb/deployment/services/kbase-ui/dist/modules/deploy/config.json", \
       "bash", "/kb/deployment/scripts/start-server.bash" ]
      