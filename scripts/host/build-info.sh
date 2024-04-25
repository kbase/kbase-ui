#!/usr/bin/env bash

echo "------------------"
echo "build-plugins.sh"
echo "------------------"

# The script we are running
export SCRIPT_MODULE="scripts.build-info"

# Arguments for the script
export INSTALL_DEST="/app/build/build/build-info.json"

# assume we are run from the root of the project.
cd tools/python

echo
echo "Creating build info"
echo

docker compose run --rm runner \
    python -m ${SCRIPT_MODULE} ${INSTALL_DEST} 

cd ../..