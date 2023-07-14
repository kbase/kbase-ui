#
# Set up and invoke the associated deno script.
#

# The HOST_APP_DIR environment variable roots the deno cli (in the form of
# docker compose) in the host.
# The HOST_APP_DIR is volume mounted as /app in the container.
export HOST_APP_DIR=${PWD}

# Should stay the same for all scripts
export DENO_SCRIPT_HOME="/app/tools/deno/scripts"

# The script we are running
export DENO_SCRIPT="install-plugins.ts"

# Arguments for the script
export PLUGINS_CONFIG_PATH="/app/config/plugins.yml"
export PLUGINS_INSTALL_DEST="/app/build"

export PLUGINS_FILTER="${1}"

echo "Installing plugins with filter ${PLUGINS_FILTER}"

# assume we are run from the root of the project.
cd tools/deno

echo
echo "Installing plugins"
echo "HOST_APP_DIR=$HOST_APP_DIR"
echo
docker compose \
    -f cli/docker-compose.yml \
    run \
    --rm \
    deno run \
    --unstable --allow-run --allow-write --allow-read --allow-net \
    ${DENO_SCRIPT_HOME}/${DENO_SCRIPT} ${PLUGINS_CONFIG_PATH} ${PLUGINS_INSTALL_DEST} ${1}
