#!/bin/bash
SCRIPT_PATH=$(dirname $(readlink -f $0))
nginx -c $SCRIPT_PATH/nginx.conf