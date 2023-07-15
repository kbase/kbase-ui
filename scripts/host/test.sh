echo "[test.sh] starting in ${PWD}, DIR=${DIR}"
echo ""
cd tools/node
ls
docker compose run --rm node npm install
docker compose run --rm node npm run test