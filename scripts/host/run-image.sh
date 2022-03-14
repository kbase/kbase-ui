docker network create kbase-dev
#   -v `pwd`/build/app/modules/plugins/auth2-client:/kb/deployment/services/kbase-ui/dist/modules/plugins/auth2-client \
export ENV=ci
echo
echo "Running kbase-ui production image in development, deploy env is '${ENV}'"
echo
docker run \
  -v `pwd`/dev/gitlab-config:/kb/deployment/config \
  --network kbase-dev \
  --hostname kbase-ui \
  --name kbase-ui \
  --rm \
  kbase/kbase-ui:dev \
  -env /kb/deployment/config/${ENV}_config.ini \
  -template /kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf \
  -template /kb/deployment/templates/config.json.tmpl:/kb/deployment/app/deploy/config.json \
  bash -x /kb/deployment/scripts/start-server.bash