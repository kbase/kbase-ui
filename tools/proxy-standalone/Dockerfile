FROM alpine:3.15

# used for processing the config file templates
RUN version=v0.15.1 && \
    wget -O - https://github.com/powerman/dockerize/releases/download/${version}/dockerize-`uname -s`-`uname -m` | install /dev/stdin /usr/local/bin/dockerize

RUN apk --update upgrade && \
    apk add --no-cache bash bash-completion ca-certificates nginx openssl && \
    mkdir -p /kb/deployment

COPY contents /kb/deployment

RUN bash /kb/deployment/maybe-install-self-signed-cert.sh

ENTRYPOINT [ \
    "dockerize", \
    "-template",  "/kb/deployment/conf/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
    "-template", "/kb/deployment/conf/cors.conf.tmpl:/etc/nginx/cors.conf", \
    "nginx"]
