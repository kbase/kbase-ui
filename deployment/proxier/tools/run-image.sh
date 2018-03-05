function usage() {
    echo 'Usage: run-image.sh env'
}

environment=$1

if [ -z "$environment" ]; then 
    echo "ERROR: argument 1, 'environment', not provided"
    usage
    exit 1
fi

if [ ! -e "deployment/proxier/conf/${environment}.env" ]; then
    echo "ERROR: environment (arg 1) does not resolve to a config file in deployment/proxier/conf/${environment}.env"
    usage
    exit 1
fi

root=$(git rev-parse --show-toplevel)
config_mount="${root}/deployment/proxier/conf"
image="kbase/kbase-ui-proxier:dev"

echo "CONFIG MOUNT: ${config_mount}"
echo "ENVIRONMENT : ${environment}"

echo "stdout sent to proxier.stdout, stderr sent to proxier.stderr"
echo "Running proxier image ${image}"
echo ":)"

docker run \
  -p 80:80 -p 443:443 --dns=8.8.8.8 --rm \
  --env-file=${config_mount}/${environment}.env \
  --network=kbase-dev \
  --name=proxier \
  ${image} \
  > proxier.stdout 2> proxier.stderr
