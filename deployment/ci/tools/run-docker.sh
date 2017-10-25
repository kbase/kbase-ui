
# runs the given docker
# docker run --mount type=bind,src=`pwd`/conf,dst=/conf 4ed624b88a0a  /conf/sample-ci.ini

export conf=$1
export ver=$2

docker run \
  --mount type=bind,src=`pwd`/conf,dst=/conf kbase/kbase-ui  \
  /conf/${conf}.ini
