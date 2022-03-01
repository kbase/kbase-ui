cd tools/deno-cli
export REL_DIR=`pwd`/../.. 
export DIR=$(cd ${REL_DIR}; pwd)
echo
echo "Installing plugins"
echo "REL_DIR=$REL_DIR"
echo "DIR=$DIR"
echo
ls $DIR
echo
docker-compose run sh