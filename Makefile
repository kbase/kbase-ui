# Makefile for kbase-ui.
#
# The general flow is as follows:
# 1. Local development = just run 'make'
# 2. KBase deployment = run 'make && make deploy'
# (this might take a little configuration depending on the
# deployment location)
# 3. Run all tests = make test
#
# This Makefile is mostly here as a convenience to the devops
# crew. The actual build/test/deploy process is managed by
# Grunt (in a common JavaScript style), but some essential tasks
# are exposed here.

# set TARGET to use different deploy-*.cfg files (deploy-ci, deploy-prod, etc)
# currently only 'prod', 'ci', and 'next' are valid variables.
TARGET			= ci
PACKAGE			= ui-common
TOPDIR			= $(PWD)
DISTLIB			= $(TOPDIR)/build
DOCSLIB			= $(TOPDIR)/docs
DEPLOY_CFG		= deploy-$(TARGET).cfg
KB_TOP			= /kb
GRUNT		    = ./node_modules/.bin/grunt
KARMA			= ./node_modules/.bin/karma

# The config used to control the build (build task)
# dev, ci, prod
# Defaults to dev
config          = dev

# The deploy environment; used by dev-time image runners
# dev, ci, next, appdev, prod
env             = ci

# The browser to test against
browser      	= chrome

# The custom docker network
# For local development.
net 			= kbase-dev

# Host is the kbase deployment host to utilize for integration tests
# ci, next, appdev, prod
host = ci

# The testing service
service = selenium-standalone

# A kbase token; used in testing tasks
token =

# functions

# check_defined variable-name message
# Ensures that the given variable 'variable-name' is defined; if not
# prints 'message' and the process exits with 1.
# thanks https://stackoverflow.com/questions/10858261/abort-makefile-if-variable-not-set
check_defined = \
    $(strip $(foreach 1,$1, \
        $(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = \
    $(if $(value $1),, \
        $(error Undefined "$1"$(if $2, ($2))$(if $(value @), \
                required by target `$@')))

.PHONY: all test build docs


# Standard 'all' target 
all: prepare-build git-info build-info build install-plugins create-deploy

# Standard 'all' target = just do the standard build
dev: prepare-build git-info build-info build install-plugins render-templates create-deploy

# See above for 'all' - just running 'make' should locally build
default:
	@echo Use "make init && make build build=TARGET build"
	@echo see docs/quick-deploy.md

# Initialization here pulls in all dependencies from Bower and NPM.
# This is **REQUIRED** before any build process can proceed.
# bower install is not part of the build process, since the bower
# config is not known until the parts are assembled...

# setup-dirs:
# 	@echo "> Setting up directories."
# 	mkdir -p temp/files
# 	mkdir -p dev/test

# node_modules:
# 	@echo "> Installing build and test tools."
# 	npm install --no-lockfile

# setup: setup-dirs

# init: setup node_modules

# quality:
# 	@echo "> Checking code quality."
# 	npm run quality

# compile:
# 	@echo "> Compiling TypeScript files."
# 	npm run compile


# Perform the build. Build scnearios are supported through the config option
# which is passed in like "make build build=ci"
# build-old: quality clean-build compile
# 	@:$(call check_defined, config, "the build configuration: defaults to 'dev'")
# 	@echo "> Building."
# 	npm run build -- --config $(config)

# New build??
# For now, everything is in static, but we need
# to compile somewhere else, then start:merge files together
# for the dist.
# build: compile


docker-network:
	@:$(call check_defined, net, "the docker custom network: defaults to 'kbase-dev'")
	bash tools/docker/create-docker-network.sh $(net)

# $(if $(value network_exists),$(echo "exists"),$(echo "nope"))

docker-ignore:
	@echo "> Syncing .dockerignore from .gitignore"
	@$(TOPDIR)/node_modules/.bin/dockerignore

docker-compose-override:
	@echo "> Creating docker compose override..."
	@echo "> With options:"
	@echo "> plugins: $(plugins)"
	@echo "> internal: $(internal-plugins)"
	@echo "> libraries: $(libraries)"
	@echo "> paths: $(paths)"
	@echo "> local-narrative: $(local-narrative)"
	@echo "> local-navigator: $(local-navigator)"
	@echo "> dynamic-services: $(dynamic-services)"
	$(eval cmd = node $(TOPDIR)/tools/js/build-docker-compose-override.js $(env) \
	  $(foreach p,$(plugins),--plugin $(p)) \
	  $(foreach p,$(plugin),--plugin $(p)) \
	  $(foreach d,$(dynamic-services),--dynamic_services $d) \
	  $(foreach s,$(services),--services $s) \
	  $(if $(findstring t,$(local-narrative)),--local_narrative) \
	  $(if $(findstring t,$(local-navigator)),--local_navigator))
	@echo "> Issuing: $(cmd)"
	$(cmd)

docker-compose-up: docker-network # docker-compose-override
	@:$(call check_defined, config, "the kbase-ui build config: defaults to 'dev'")
	@:$(call check_defined, env, "the runtime (deploy) environment: defaults to 'dev'")
	@echo "> Building and running docker image for development"
	@echo ">   DEPLOY_ENV=$(env)"
	$(eval cmd = cd dev; DEPLOY_ENV=$(env) docker-compose up \
		$(if $(findstring t,$(build-image)),--build))
	@echo "> Issuing $(cmd)"
	$(cmd)
	@(eval docker-compose rm -v -f -s)

# @cd dev; BUILD=$(build) DEPLOY_ENV=$(env) docker-compose up --build

docker-compose-clean:
	@echo "> Cleaning up after docker compose..."
	@cd dev; BUILD=$(config) DEPLOY_ENV=$(env) docker-compose rm -f -s
	@echo "> If necessary, Docker containers have been stopped and removed"

docker-network-clean:
	# @:$(call check_defined, net, "the docker custom network: defaults to 'kbase-dev'")
	bash tools/docker/clean-docker-network.sh

start: docker-compose-up

stop: docker-compose-clean docker-network-clean

# Tests are managed by grunt, but this also mimics the workflow.
#init build
unit-tests:
	$(KARMA) start test/unit-tests/karma.conf.js

# Filter test files to focus on just selected ones.
# e.g. dataview/ will match just test files which include a dataview path element, effectively
# selecting just the dataview plugin tests.
focus =
blur =

integration-tests:
	@:$(call check_defined, env, first component of hostname and kbase environment)
	@:$(call check_defined, browser, the browser to test against)
	@:$(call check_defined, service, the testing service)
	@:$(call check_defined, token, the testing user auth tokens)
	ENV="$(env)" BROWSER="$(browser)" SERVICE_USER="$(user)" SERVICE_KEY="$(key)" SERVICE="$(service)" TOKEN="${token}" FOCUS="${focus}" BLUR="${blur}" npx wdio run ./test/wdio.conf.service.js --env=$(env)
fy=false clone https://oauth2:s5TDQnKk4kpHXCVdUNfh@gitlab.kbase.lbl.gov:1443/devops/kbase_ui_config.git

get-gitlab-config:
	mkdir -p dev/gitlab-config; \
	git clone -b develop ssh://git@gitlab.kbase.lbl.gov/devops/kbase_ui_config.git dev/gitlab-config

clean-gitlab-config:
	rm -rf dev/gitlab-config

dev-cert:
	bash tools/make-dev-cert.sh

remove-dev-cert:
	rm tools/proxy/contents/ssl/*

clean-build:
	rm -rf build/dist

prepare-build:
	sh scripts/host/prepare-build.sh

render-templates:
	DIR=$(TOPDIR) ENV=$(env) bash tools/dockerize/scripts/render-templates.sh

#
# Builds the app on the host, via docker containers
# Results end up in the build directory
#
build:
	sh scripts/host/build.sh

# Build and copy to dist
build-dist: build create-deploy

create-deploy:
	sh scripts/host/create-deploy.sh

#
# Standalone plugin fetcher. For local development one should
# run this first.
#
install-plugins:
	sh tools/deno/scripts/install-plugins.sh

git-info:
	sh tools/deno/scripts/git-info.sh

build-info:
	sh tools/deno/scripts/build-info.sh
#
# TODO May get rid of, need at least for now for testing.
# Should create a docker compose override file in the location
# specified in the script, which should be dev.
#
build-docker-compose-override:
	sh tools/deno/scripts/docker-compose-override.sh

start-local-server: # docker-network # docker-compose-override
	@:$(call check_defined, config, "the kbase-ui build config: defaults to 'dev'")
	@:$(call check_defined, env, "the runtime (deploy) environment: defaults to 'dev'")
	@echo "> Building and running docker image for development"
	@echo ">   DEPLOY_ENV=$(env)"
	$(eval cmd = cd dev && DEPLOY_ENV=$(env) docker compose up \
		$(if $(findstring t,$(build-image)),--build))
	@echo "> Issuing $(cmd)"
	$(cmd)
	@(cd dev; eval docker compose rm -v -f -s)

stop-local-server: # docker-network # docker-compose-override
	@:$(call check_defined, config, "the kbase-ui build config: defaults to 'dev'")
	@:$(call check_defined, env, "the runtime (deploy) environment: defaults to 'dev'")
	@echo "> Building and running docker image for development"
	@echo ">   DEPLOY_ENV=$(env)"
	$(eval cmd = cd dev && DEPLOY_ENV=$(env) docker compose rm -v -f -s)
	@echo "> Issuing $(cmd)"
	$(cmd)

local-server: all build-image docker-network build-docker-compose-override start-local-server

#
# Clears plugins out of the build directory.
#
remove-plugins:
	rm -rf build/plugins/*

#
# Builds the production app image
#
build-image:
	sh scripts/host/build-image.sh

#
# Runs just the image. Can be used in concert with a 
# separate proxy; cannot be used alone.
#
run-image:
	sh scripts/host/run-image.sh

# The development server; runs CRA dev server in container

start-dev-server:
	sh scripts/host/start-dev-server.sh

stop-dev-server:
	sh scripts/host/stop-dev-server.sh

start-dev-support-server:
	sh scripts/host/start-dev-support-server.sh

# Testing

test:
	@echo Testing yet to be done...