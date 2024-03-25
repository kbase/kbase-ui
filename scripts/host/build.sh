cd tools/node
docker compose run --rm node-tool npm ci
docker compose run -e BASE_PATH --rm node-tool npm run build 