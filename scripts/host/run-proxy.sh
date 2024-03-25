#!/usr/bin/env bash

#
# A script to run the development proxy in standalone mode.
#
# To use it, you first need to generate the proxy.env file.
#

if ! [ -f ./.devcontainer/proxy.env ]
then
    echo "---------------------------------"
    echo " ERROR: proxy env file not found "
    echo "---------------------------------"
    echo 
    echo "The .devcontainer/proxy.env file must exist in order to "
    echo "run the development proxy."
    echo "Please see docs/development.md and Taskfile"
    echo
    echo "To generate proxy.env:"
    echo
    echo "LOCAL_NARRATIVE='x' LOCAL_KBASE_UI='x' KBASE_UI_HOSTNAME='x' SERVICE_PROXIES=''x' ./Taskfile run-proxy"
    echo
    echo "where"
    echo "LOCAL_NARRATIVES should be set to 't' to enable proxying to a local narrative, otherwise it will proxy to the deployment"
    echo "LOCAL_KBASE_UI should be set to 't' to enable proxying to a local kbase-ui, otherwise it will proxy to KBASE_UI_DOMAIN"
    echo "SERVICE_PROXIES should be set to a comma-separated list of local service container hostnames (which must be the same as"
    echo "  the service's path in the endpoint."

    echo
    exit 1
fi

echo "okay, will do"
cd tools/proxy
docker compose up
docker compose rm -f