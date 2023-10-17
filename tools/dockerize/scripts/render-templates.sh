set -e 
echo "Rendering kbase-ui config file from template for environment '${ENV}' using base app dir '${DIR}'"
echo "Parameters (Environment Variables):"
echo "  ENV=${ENV}"
echo "  DIR=${DIR}"
echo "  DEFAULT_PATH=${DEFAULT_PATH}"
echo "  HIDE_HEADER=${HIDE_HEADER}"
echo "  HIDE_NAVIGATION=${HIDE_NAVIGATION}"
echo "  INTEGRATED_HAMBURGER_AND_LOGO=${INTEGRATED_HAMBURGER_AND_LOGO}"
echo ""
docker compose \
    -f ${DIR}/tools/dockerize/docker-compose.yml \
    run \
    --rm \
    dockerize \
    -template /app/deployment/templates/config.json.tmpl:/app/build/deploy/config.json \
    -env /app/dev/gitlab-config/${ENV}_config.ini
