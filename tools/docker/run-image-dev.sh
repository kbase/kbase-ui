
#!/bin/bash
#
# Runs the kbase-ui image which has already been built for the current branch.
#
# This is a develop-time tool.
#

function usage() {
    echo 'Usage: run-image-dev.sh env [-p external-plugin] [-i internal-plugin] [-s kbase-ui-service] [-l lib-module-dir:lib-name:source-path]'
}

environment=$1

if [ -z "$environment" ]; then 
    echo "ERROR: argument 1, 'environment', not provided"
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
echo "BRANCH : ${branch}"

echo "READING OPTIONS"

# Initialize our own variables:
mounts=""
envs=""


# from: https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

# echo "key ${key}"
# echo "value ${2}"
# echo ""

case $key in
    ### External plugins, located at the same directory level as the kbase-ui repo
    -p|--plugin)
    plugin="$2"
    echo "Using external plugin: ${plugin}"
    mounts="$mounts --mount type=bind,src=${root}/../kbase-ui-plugin-${plugin}/src/plugin,dst=/kb/deployment/services/kbase-ui/dist/modules/plugins/${plugin}"
    shift # past argument
    shift # past value
    ;;
    ### Internal plugins, located within the repo in src/plugins
    -i|--internal)
    plugin="$2"
    echo "Using internal plugin: ${plugin}"
    mounts="$mounts --mount type=bind,src=${root}/src/plugins/${plugin},dst=/kb/deployment/services/kbase-ui/dist/modules/plugins/${plugin}"
    shift # past argument
    shift # past value
    ;;
    ### External kbase libraries, located in a sister directory to kbase-ui
    -l|--lib)
    lib="$2"
    # local l
    read libName libPath libModule  <<<$(IFS=':';echo $lib)
    # e.g. kb_common:common-js:dist/kb_common
    echo "Using library repo: name = $libName, path = $libPath, module = $libModule"
     mounts="$mounts --mount type=bind,src=${root}/../kbase-${libName}/${libPath},dst=/kb/deployment/services/kbase-ui/dist/modules/${libModule}"
    shift
    shift
    ;;
    ### Internal ui services, located within modules/app/services
    -s|--service)
    service="$2"
    echo "Using internal services: ${service}"
    mounts="$mounts --mount type=bind,src=${root}/src/client/modules/app/services/${service}.js,dst=/kb/deployment/services/kbase-ui/dist/modules/app/services/${service}.js"
    shift # past argument
    shift # past value
    ;;
    ### data
    -d|--data)
    data="$2"
    echo "Using internal data: ${data}"
    mounts="$mounts --mount type=bind,src=${root}/src/client/data/${data},dst=/kb/deployment/services/kbase-ui/dist/data/${data}"
    shift # past argument
    shift # past value
    ;;
    ### arbitrary internal path
    -f|--folder)
    folder="$2"
    echo "Using internal folder: ${folder}"
    mounts="$mounts --mount type=bind,src=${root}/src/client/modules/${folder},dst=/kb/deployment/services/kbase-ui/dist/modules/${folder}"
    shift # past argument
    shift # past value
    ;;
     -y|--dynamic_service_proxies)
    dynamic_service_proxies="$2"
    echo "Using dynamic service proxy: ${dynamic_service_proxies}"
    # mounts="$mounts --mount type=bind,src=${root}/../kbase-ui-plugin-${plugin}/src/plugin,dst=/kb/deployment/services/kbase-ui/dist/modules/plugins/${plugin}"
    # envs="$envs --env "'"'"dynamic_service_proxies=${dynamic_service_proxies}"'"'
    envs="$envs -e dynamic_service_proxies="'"'"${dynamic_service_proxies}"'"'
    shift # past argument
    shift # past value
    ;;
    *)    # unknown option
    POSITIONAL+=("$1") # save it in an array for later
    shift # past argument
    ;;
esac
done
set -- "${POSITIONAL[@]}" # restore positional parameters

echo "MOUNTS: $mounts"
echo "ENVS:   $envs"

image_tag="${branch}"

echo "stdout sent to kbase-ui.stdout, stderr sent to kbase-ui.stderr"
echo "Running kbase-ui image kbase/kbase-ui:${image_tag}"
echo ":)"

cmd="docker run \
  --rm \
  --env-file ${config_mount}/${environment}.env \
  $envs \
  --name=kbase-ui-container \
  --network=kbase-dev \
  $mounts \
  kbase/kbase-ui:${image_tag}"
echo "RUNNING: $cmd"
eval $cmd


#   > temp/files/kbase-ui.stdout