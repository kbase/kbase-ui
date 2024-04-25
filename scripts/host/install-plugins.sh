#!/usr/bin/env bash

echo "------------------"
echo "install-plugins.sh"
echo "------------------"
# The HOST_APP_DIR is volume mounted as /app in the container.
export HOST_APP_DIR=${PWD}

# The script we are running
export SCRIPT_MODULE="scripts.install-plugins"

# Arguments for the script
export PLUGINS_CONFIG_PATH="/app/config/plugins.yml"
export PLUGINS_INSTALL_DEST="/app/build/plugins"

export GH_TOKEN="${GH_TOKEN:?GH_TOKEN not set}"

echo "GH_TOKEN is set"

# assume we are run from the root of the project.
cd tools/python

echo
echo "Installing plugins"
echo "HOST_APP_DIR=$HOST_APP_DIR"
echo

docker compose run --rm runner \
    python -m ${SCRIPT_MODULE} ${PLUGINS_CONFIG_PATH} ${PLUGINS_INSTALL_DEST} ${GH_TOKEN}

cd ../..