#
# start-dev-server.sh
#
# Host-side script which sets up environment variables for and ultimately runs the
# local development container.
#
# Establish defaults for all of our parameters, because they probably will never change, but,
# you never know.

export DEFAULT_DEPLOY_ENV=ci

# These resources are built into the codebase
export DEFAULT_APP_DIR="${PWD}/react-app"
export DEFAULT_SCRIPTS_DIR="${PWD}/deployment/scripts/plugins"

# These are generated

# Generated by "make get-gitlab-config" or manually downloading the gitlab config.
# Status:
# The KBase gitlab config is no now longer exposed publicly, and no-one seems to know
# how to tunnel to it. But one can still pull up the gitlab ui via an https tunnel and download
# from the ui.
# TODO: Fix this; should not be hard since https can be ssh-tunneled
export DEFAULT_CONFIG_DIR="${PWD}/dev/gitlab-config"

#
# The plugins are installed via make install-plugins
#
export DEFAULT_PLUGINS_DIR="${PWD}/build/dist/deploy/plugins"

export APP_DIR="${APP_DIR:-$DEFAULT_APP_DIR}"
export CONFIG_DIR="${CONFIG_DIR:-$DEFAULT_CONFIG_DIR}"
export PLUGINS_DIR="${PLUGINS_DIR:-$DEFAULT_PLUGINS_DIR}"
export DEPLOY_ENV="${ENV:-$DEFAULT_DEPLOY_ENV}"

# Inform the user; helpful for debugging any startup issues.
echo "Starting Dev Server"
echo "APP_DIR=$APP_DIR"
echo "CONFIG_DIR=$CONFIG_DIR"
echo "PLUGINS_DIR=$PLUGINS_DIR"
echo "DEPLOY_ENV=$DEPLOY_ENV"

docker-compose -f docker-compose-dev.yml up
