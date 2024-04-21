#!/usr/bin/env bash

echo "------------------"
echo "git-info.sh"
echo "------------------"

# The script we are running
export SCRIPT="/app/tools/python/git-info.py"

# Arguments for the script
export INSTALL_DEST="/app/build/build/git-info.json"

# assume we are run from the root of the project.
cd tools/python

echo
echo "Creating git info"
echo

docker compose run runner \
    python ${SCRIPT} ${INSTALL_DEST} 

cd ../..