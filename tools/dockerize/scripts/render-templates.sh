set -e 

docker compose \
    -f ${DIR}/tools/dockerize/docker-compose.yml \
    run \
    --rm \
    dockerize \
    -template /app/deployment/templates/config.json.tmpl:/app/build/deploy/config.json \
    -env /app/dev/gitlab-config/${ENV}_config.ini
