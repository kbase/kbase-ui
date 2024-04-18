cd tools/node
docker compose run --rm node-tool npm ci
docker compose run -e KBASE_UI_BASE_PATH --rm node-tool npm run build 