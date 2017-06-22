#!/bin/bash
SCRIPT_PATH=$(dirname $(readlink -f $0))
echo "Setting up travis from $SCRIPT_PATH"
DEPLOY_DEST=/tmp/www
rm -rf $DEPLOY_DEST
mkdir -p $DEPLOY_DEST
cp -pr $SCRIPT_PATH/../../build/dist/client/* $DEPLOY_DEST