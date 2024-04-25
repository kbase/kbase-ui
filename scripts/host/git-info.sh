#!/usr/bin/env bash

echo "------------------"
echo "git-info.sh"
echo "------------------"

# The script we are running
export SCRIPT_MODULE="scripts.git-info"

# Arguments for the script
export INSTALL_DEST="/app/build/build/git-info.json"

# assume we are run from the root of the project.
cd tools/python

echo
echo "Creating git info in ${INSTALL_DEST}"
echo

docker compose run --rm runner \
    python -m ${SCRIPT_MODULE} ${INSTALL_DEST} 

cd ../..