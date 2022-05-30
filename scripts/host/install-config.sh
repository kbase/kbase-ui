
cd tools/dockerize
export DIR="$PWD/../.."
mkdir -p $DIR/build/deploy
docker compose run --rm dockerize \
  -template /app/deployment/templates/config.json.tmpl:/app/build/deploy/config.json \
  -env /app/dev/gitlab-config/ci_config.ini