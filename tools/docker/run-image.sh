
#!/bin/bash
#
# Runs the kbase-ui image which has already been built for the current branch.
#
# This is a minimal local deployment tool.
# See run-image-dev.sh 
#

function usage() {
    echo 'Usage: run-image.sh <env> <net>'
    echo '  <env> is the deploy environment, either dev, ci, next, appdev or prod'
    echo '  <net> is the docker custom network'
}

environment=$1

if [ -z "$environment" ]; then 
    echo "ERROR: argument 1, 'environment', not provided"
    usage
    exit 1
fi

network=$2
if [ -z "$network" ]; then 
    echo "ERROR: argument 2, 'network', not provided"
    usage
    exit 1
fi

root=$(git rev-parse --show-toplevel)
config_mount="${root}/config/deploy"
branch=$(git symbolic-ref --short HEAD 2>&1)

if [ ! -e "${config_mount}/${environment}.env" ]; then
    echo "ERROR: environment (arg 1) does not resolve to a config file in ${config_mount}/${environment}.env"
    usage
    exit 1
fi

echo "CONFIG MOUNT: ${config_mount}"
echo "ENVIRONMENT : ${environment}"
echo "NETWORK     : ${network}"
echo "BRANCH      : ${branch}"

image_tag="${branch}"

echo "Running kbase-ui image kbase/kbase-ui:${image_tag}"
echo ":)"

docker run \
  --rm \
  --env-file ${config_mount}/${environment}.env \
  --name=kbase-ui-container \
  --network=${network} \
  kbase/kbase-ui:${image_tag} 
