#!/bin/bash

function usage() {
    echo 'Usage: run-image.sh env type'
}

environment=$1

if [ -z "$environment" ]; then 
    echo "ERROR: argument 1, 'environment', not provided"
    usage
    exit 1
fi

if [ ! -e "deployment/conf/${environment}.env" ]; then
    echo "ERROR: environment (arg 1) does not resolve to a config file in deployment/conf/${environment}.env"
    usage
    exit 1
fi

root=$(git rev-parse --show-toplevel)
config_mount="${root}/deployment/conf"

echo "CONFIG MOUNT: ${config_mount}"
echo "ENVIRONMENT : ${environment}"

echo "READING OPTIONS"

image_tag="develop"

docker run \
  --rm \
  --env-file ${config_mount}/${environment}.env \
  --env deployed=false \
  --network=kbase-dev \
  --name=kbase-ui-container \
  kbase/kbase-ui:${image_tag}  
