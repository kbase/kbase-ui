cd tools/deno-cli
export REL_DIR=`pwd`/../.. 
export DIR=$(cd ${DIR}; pwd)
echo
echo "Installing plugins"
echo "REL_DIR=$REL_DIR"
echo "DIR=$DIR"
echo
ls $DIR
echo
docker-compose run \
    deno run --unstable --allow-run --allow-write --allow-read \
    /app/scripts/deno/install-plugins.ts /app/config/plugins.yaml /app/build/dist/modules