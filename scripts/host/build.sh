cd tools/node
docker compose run --rm node npm uninstall *
docker compose run --rm node npm install
docker compose run --rm node npm run build 