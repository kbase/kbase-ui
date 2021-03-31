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

# A timeout parameter; used for integration tests
timeout = 

# An interval parameter; used to control the pause between tests in integration tests
interval = 

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

# Standard 'all' target = just do the standard build
all:
	@echo Use "make init && make build build=TARGET build"
	@echo see docs/quick-deploy.md

# See above for 'all' - just running 'make' should locally build
default:
	@echo Use "make init && make build build=TARGET build"
	@echo see docs/quick-deploy.md

# Initialization here pulls in all dependencies from Bower and NPM.
# This is **REQUIRED** before any build process can proceed.
# bower install is not part of the build process, since the bower
# config is not known until the parts are assembled...

setup-dirs:
	@echo "> Setting up directories."
	mkdir -p temp/files
	mkdir -p dev/test

node_modules:
	@echo "> Installing build and test tools."
	npm install

setup: setup-dirs

init: setup node_modules

quality:
	@echo "> Checking code quality."
	npm run quality

compile:
	@echo "> Compiling TypeScript files."
	npm run compile


# Perform the build. Build scnearios are supported through the config option
# which is passed in like "make build build=ci"
build: quality clean-build compile
	@:$(call check_defined, config, "the build configuration: defaults to 'dev'")
	@echo "> Building."
	npm run build -- --config $(config)

docker-network:
	@:$(call check_defined, net, "the docker custom network: defaults to 'kbase-dev'")
	bash tools/docker/create-docker-network.sh $(net)

# $(if $(value network_exists),$(echo "exists"),$(echo "nope"))

docker-ignore:
	@echo "> Syncing .dockerignore from .gitignore"
	@$(TOPDIR)/node_modules/.bin/dockerignore

# Build the docker image, assumes that make init and make build have been done already
docker-image:
	@echo "> Building docker image for this branch; assuming we are on Travis CI"
	@bash $(TOPDIR)/deployment/tools/build-travis.bash

fake-travis-build:
	@echo "> Building docker image for this branch, using fake "
	@echo "  Travis environment variables derived from git."
	@bash $(TOPDIR)/tools/docker/build-travis-fake.bash


docker-compose-override:
	@echo "> Creating docker compose override..."
	@echo "> With options:"
	@echo "> plugins: $(plugins)"
	@echo "> internal: $(internal-plugins)"
	@echo "> libraries: $(libraries)"
	@echo "> paths: $(paths)"
	@echo "> local-narrative: $(local-narrative)"
	@echo "> dynamic-services: $(dynamic-services)"
	$(eval cmd = node $(TOPDIR)/tools/js/build-docker-compose-override.js $(env) \
	  $(foreach p,$(plugins),--plugin $(p)) \
	  $(foreach p,$(plugin),--plugin $(p)) \
	  $(foreach i,$(internal-plugins),--internal $i) \
	  $(foreach l,$(libraries),--lib $l) \
	  $(foreach f,$(paths),---path $f) \
	  $(foreach d,$(dynamic-services),--dynamic_services $d) \
	  $(foreach s,$(services),--services $s) \
	  $(if $(findstring t,$(local-docs)),--local_docs) \
	  $(if $(findstring t,$(local-narrative)),--local_narrative))
	@echo "> Issuing: $(cmd)"
	$(cmd)

docker-compose-up: docker-network docker-compose-override
	@:$(call check_defined, config, "the kbase-ui build config: defaults to 'dev'")
	@:$(call check_defined, env, "the runtime (deploy) environment: defaults to 'dev'")
	@echo "> Building and running docker image for development"
	@echo ">   BUILD_CONFIG=$(config) DEPLOY_ENV=$(env)"
	$(eval cmd = cd dev; BUILD_CONFIG=$(config) DEPLOY_ENV=$(env) docker-compose up \
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

start: init docker-compose-up

stop: docker-compose-clean docker-network-clean

dev-start: init docker-compose-up

dev-stop: docker-compose-clean docker-network-clean

uuid:
	@node ./tools/gen-uuid.js

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
	@:$(call check_defined, service, the testing service )
	@:$(call check_defined, token, the testing user auth tokens )
	ENV="$(env)" BROWSER="$(browser)" SERVICE_USER="$(user)" SERVICE_KEY="$(key)" SERVICE="$(service)" TOKEN="${token}" FOCUS="${focus}" BLUR="${blur}"  DEFAULT_TASK_TIMEOUT="${timeout}" DEFAULT_PAUSE_FOR="${interval}" $(GRUNT) webdriver:service --env=$(env)

travis-tests:
	$(GRUNT) test-travis

test: unit-tests

test-travis: unit-tests travis-tests

# Clean slate
clean: clean-docs
	$(GRUNT) clean-all

clean-temp:
	$(GRUNT) clean:temp

clean-build:
	$(GRUNT) clean-build

clean-docs:
	@rm -rf ./docs/book/_book
	@rm -rf ./docs/node_modules

# If you need more clean refinement, please see Gruntfile.js, in which you will
# find clean tasks for each major build artifact.

docs:
	cd docs; \
	npm install; \
	./node_modules/.bin/gitbook build ./book

docs-viewer: docs
	cd docs; \
	(./node_modules/.bin/wait-on -t 10000 http://localhost:4000 && ./node_modules/.bin/opn http://localhost:4000 &); \
	./node_modules/.bin/gitbook serve ./book

# git -c http.sslVerify=false clone https://oauth2:s5TDQnKk4kpHXCVdUNfh@gitlab.kbase.lbl.gov:1443/devops/kbase_ui_config.git
get-gitlab-config:
	mkdir -p dev/gitlab-config; \
	git clone -b develop ssh://git@gitlab.kbase.lbl.gov/devops/kbase_ui_config.git dev/gitlab-config

clean-gitlab-config:
	rm -rf dev/gitlab-config

dev-cert:
	bash tools/make-dev-cert.sh

rm-dev-cert:
	rm tools/proxy/contents/ssl/*

