# cd tools/deno/cli
# DIR=`pwd`/../.. docker compose run deno run \
#   --unstable --allow-run --allow-write --allow-read \
#   /app/scripts/deno/docker-compose-override.ts /app/dev \
#   --config-dir `pwd`/../../../dev/gitlab-config

# docker run -v `pwd`/../..:/app --rm deno run --unstable --allow-run --allow-write --allow-read /app/scripts/deno/docker-compose-override.ts /app/dev/docker-compose-override.yml --config-dir /app/dev/gitlab-config

export HOST_APP_DIR=${PWD}

# Should stay the same for all scripts
export DENO_SCRIPT_HOME="/app/tools/deno/scripts"

# The script we are running
export DENO_SCRIPT="docker-compose-override.ts"

# Arguments for the script
# export PLUGINS_CONFIG_PATH="/app/config/plugins.yml"
# export PLUGINS_INSTALL_DEST="/app/build"

# assume we are run from the root of the project.
cd tools/deno

echo
echo "Creating docker compose override"
echo "HOST_APP_DIR=$HOST_APP_DIR"
echo
docker compose \
    -f cli/docker-compose.yml \
    run \
    --rm \
    deno run \
    --unstable --allow-run --allow-write --allow-read \
    ${DENO_SCRIPT_HOME}/${DENO_SCRIPT} /app/dev --config-dir ${HOST_APP_DIR}/dev/gitlab-config