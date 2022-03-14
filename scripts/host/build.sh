cd tools/node
DIR=`pwd`/../../react-app docker compose run --rm node npm install
DIR=`pwd`/../../react-app docker compose run --rm node npm run build 