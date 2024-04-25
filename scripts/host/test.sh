echo "[test.sh] starting in ${PWD}, DIR=${DIR}"
echo ""
cd tools/node
ls
docker compose run --rm node-tool npm ci
docker compose run --rm node-tool npm run test