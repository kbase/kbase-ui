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
export DENO_SCRIPT="build-info.ts"

# Arguments for the script
export INSTALL_DEST="/app/build/build/build-info.json"

# assume we are run from the root of the project.
cd tools/deno

echo
echo "Creating git info"
echo "HOST_APP_DIR=$HOST_APP_DIR"
echo
docker compose \
    -f cli/docker-compose.yml \
    run \
    --rm \
    deno run \
    --unstable --allow-run --allow-write --allow-read \
    ${DENO_SCRIPT_HOME}/${DENO_SCRIPT} ${INSTALL_DEST}
