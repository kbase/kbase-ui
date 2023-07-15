cd tools/deno
docker compose \
    -f cli/docker-compose.yml \
    run \
    --rm \
    deno bash