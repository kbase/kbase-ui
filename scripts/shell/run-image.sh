docker run \
  -v `pwd`/dev/gitlab-config:/kb/deployment/config \
  --network kbase-dev \
  --hostname kbase-ui \
  --name kbase-ui \
  --rm \
  -v `pwd`/build/app/modules/plugins/auth2-client:/kb/deployment/services/kbase-ui/app/modules/plugins/auth2-client \
  kbase/kbase-ui:dev \
  -env /kb/deployment/config/ci_config.ini \
    -template /kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf \
  -template /kb/deployment/templates/config.json.tmpl:/kb/deployment/services/kbase-ui/app/modules/deploy/config.json \
  bash -x /kb/deployment/scripts/start-server.bash