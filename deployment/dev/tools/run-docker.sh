
# runs the given docker
# docker run --mount type=bind,src=`pwd`/conf,dst=/conf 4ed624b88a0a  /conf/sample-ci.ini

# For local development, we expose both 80 and 443 -- we always run on https against the ui and services.
#
# DNS is set to google for now; leaving it alone causes it to use the host for DNS resolution, which
# has the unfortunate side effect of propagating the /etc/hosts entries as well, which messes
# up the proxying of kbase services.
#
# We mount the configuration directory in, but we could copy it. For modeling the flexibility of deployment
# reconfig, though, it should be mounted from the host environment. The configuration directory
# location is provided as arg1. This directory is mounted as /conf in the docker container.
#
# The second argument is the deployment environment - dev, ci, next, appdev, prod - which corresponds
# to the config file within that location.
#
# Then we mount whichever directories we want to be working on.
#
# TODO: this should be driven either by command line options or simply add a config section in here to
# allow declaring which plugins or bits of the ui source to mount inside.
# we use the :dev image
# we specify the configuration target as the first environment (dev, ci, next, appdev, prod). This lets
# lets us easily swap out the targeted environment without rebuilding or anything.
# NOTE: Just because the config is swapped to a different environment doesn't mean the build reflects it.
# There is a separate build for dev, ci and prod, which expose different bits of the ui. Because this
# impacts the dependencies loaded and integrated, it is not something that can be configured here.
# Well, it COULD be, I supose...
#

# e.g. bash ./deployment/dev/tools/run-docker.sh `pwd`/deployment/conf dev

# export config_mount=$1

environment=$1

if [ -z "$environment" ]; then 
    echo "'environment' shell variable not set"
    exit 1
fi

root=$(git rev-parse --show-toplevel)
config_mount="${root}/deployment/conf"

echo "CONFIG MOUNT: ${config_mount}"
echo "ENVIRONMENT : ${environment}"

echo "READING OPTIONS"


# Initialize our own variables:
mounts=""


# from: https://stackoverflow.com/questions/192249/how-do-i-parse-command-line-arguments-in-bash
POSITIONAL=()
while [[ $# -gt 0 ]]
do
key="$1"

case $key in
    -p|--plugin)
    plugin="$2"
    echo "Using external plugin: ${plugin}"
    mounts="$mounts --mount type=bind,src=${root}/../kbase-ui-plugin-${plugin}/src/plugin,dst=/kb/deployment/services/kbase-ui/modules/plugins/${plugin}"
    shift # past argument
    shift # past value
    ;;
    -i|--internal)
    plugin="$2"
    echo "Using internal plugin: ${plugin}"
    mounts="$mounts --mount type=bind,src=${root}/src/client/modules/plugins/${plugin},dst=/kb/deployment/services/kbase-ui/modules/plugins/${plugin}"
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


# --mount type=bind,src=${root}/../kbase-ui-plugin-jgi-search/src/plugin,dst=/kb/deployment/services/kbase-ui/modules/plugins/jgi-search \

docker run \
  -p 80:80 -p 443:443 --dns=8.8.8.8 \
  --mount type=bind,src=${config_mount},dst=/conf \
  $mounts \
  kbase/kbase-ui:dev /conf/${environment}.ini
