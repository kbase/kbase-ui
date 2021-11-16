cd tools/deno-cli
export DIR=`pwd`/../.. 
export ABS_DIR=$(cd ${DIR}; pwd)
echo
echo "Installing plugins"
echo "DIR=$DIR"
echo "ABS_DIR=$ABS_DIR"
echo
ls $DIR
echo
docker-compose run \
    deno run --unstable --allow-run --allow-write --allow-read \
    /app/scripts/deno/install-plugins.ts /app/config/plugins.yaml /app/build/dist/modules