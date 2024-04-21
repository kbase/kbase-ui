#!/usr/bin/env bash

echo "------------------"
echo "build-plugins.sh"
echo "------------------"

# The script we are running
export SCRIPT="/app/tools/python/build-info.py"

# Arguments for the script
export INSTALL_DEST="/app/build/build/build-info.json"

# assume we are run from the root of the project.
cd tools/python

echo
echo "Creating build info"
echo

docker compose run runner \
    python ${SCRIPT} ${INSTALL_DEST} 

cd ../..