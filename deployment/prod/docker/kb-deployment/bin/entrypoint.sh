#!/bin/bash
#
# This script is used as the entrypoint for the docker image
#
# This entrypoint script defaults to using environment variables to populate
# a jinja2 config template and writing out the config before starting the service
#
# If a first parameter is given it overrides the environment variables for the
# data source and is either a file path or a URL
# If a second parameter is given it overrides the default template and it should be
# either a file path or a URL
#
# If there is a readable file at /run/secrets/auth_data then it will be read in
# and passed as a header for a request to the data source URL, it must be in the
# form "HEADER_NAME:VALUE" that httpie uses for custom headers. For example, to
# set a gitlab private token header you would create a file that contains
# "PRIVATE-TOKEN:mesoextrasecret"
# A readable file at /run/secrets/auth_template is used for custom headers to the
# template URL. Note that they are separated to avoid leaking creds to a URL that
# doesn't require them
#

# Define an error exit function
function error_exit
{
	echo "$1" 1>&2
	exit 1
}

# This is the path to the jinja2 template tool, some derivative of
# this: https://github.com/kolypto/j2cli
export J2=/usr/bin/jinja2


DIR="$( cd "$( dirname "$0" )" && pwd )"
# Default config template
TEMPLATE=$DIR/../conf/deployment_templates/nginx.conf.j2

# This is the path to the nginx config created by template above
NGINX_CONFIG=/etc/nginx/nginx.conf

# Config.json template, uses the same data source
CFG_JSON_TEMPLATE=$DIR/../conf/deployment_templates/config.json.j2

# Destination for the config.json template above
CONFIG_JSON=$DIR/../services/kbase-ui/modules/deploy/config.json

# Verify that the directory that the config.json goes into exists, otherwise
# create it
CFG_DIR="$(dirname $CONFIG_JSON)"
if [ ! -d $CFG_DIR ]; then
    mkdir -p $CFG_DIR
fi

# Default data source is empty, resulting in env variables being used
DATA_SRC=""

# Set empty default values for the auth headers
AUTH_DATA=""
AUTH_TEMPLATE=""

# Auth header secret paths - can be declared in docker-compose secrets declaration
if [ -r "/run/secrets/auth_data" ]; then
     AUTH_DATA=`cat /run/secrets/auth_data`
fi
if [ -r "/run/secrets/auth_template" ]; then
    AUTH_TEMPLATE=`cat /run/secrets/auth_template`
fi

# If we have a first argument see if it is a file else treat a URL, this
# is the dictionary context for the jinja2 template config file
if [ "$1" ] ; then
    if [ -r $1 ] ; then
        DATA_SRC=$1
    else
        TMPDIR=/tmp/data$$
        mkdir $TMPDIR
        # Fetch the file, and have it error out on any redirects to avoid a 200 response
        # that is just a redirect to a login screen. Ignore cert signing issues for when
        # we connect to an internal server with self-signed certs.
        wget -q -nd --max-redirect=0 --no-check-certificate --header="${AUTH_DATA}" -P $TMPDIR -N $1  || \
            error_exit "Error fetching $1"
        # Use a file glob to pickup whatever the file name ended up being (to avoid parsing URL for name)
        DATA_SRC=$TMPDIR/*
    fi
fi

# If we are given a second parameter treat it as a template file path or
# a URL
if [ "$2" ] ; then
    if [ -r $2 ]; then
        TEMPLATE=$2
    else
        # Create a temp directory for downloading the file so that it is the only
        # file there
        TMPDIR2=/tmp/template$$
        mkdir $TMPDIR2
        pushd $TMPDIR2
        # Ignore certs signing issues for when we connect to an internal server with self-signed certs.
        wget -q -nd --max-redirect=0 --no-check-certificate --header="${AUTH_TEMPLATE}" -P $TMPDIR2 -N $2 || \
            error_exit "Error fetching $2"
        popd
        TEMPLATE=$TMPDIR2/*
    fi
fi

echo "TEMPLATE ${TEMPLATE}"
echo "DATA SRC ${DATA_SRC}"
echo "CFG TEMPLATE ${CFG_JSON_TEMPLATE}"

# Populate the nginx config as well as the config.json
${J2} $TEMPLATE $DATA_SRC > $NGINX_CONFIG && \
${J2} $CFG_JSON_TEMPLATE $DATA_SRC > $CONFIG_JSON && \
nginx
