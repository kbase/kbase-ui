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
config			= dev
directory		= build
DEV_DOCKER_CONTEXT	= $(TOPDIR)/deployment/dev/docker/context
CI_DOCKER_CONTEXT	= $(TOPDIR)/deployment/ci/docker/context
PROD_DOCKER_CONTEXT	= $(TOPDIR)/deployment/prod/docker/context
PROXIER_DOCKER_CONTEXT     = $(TOPDIR)/deployment/proxier/docker/context

# Standard 'all' target = just do the standard build
all:
	@echo Use "make init && make config=TARGET build"
	@echo see docs/quick-deploy.md

# See above for 'all' - just running 'make' should locally build
default:
	@echo Use "make init && make config=TARGET build"
	@echo see docs/quick-deploy.md

# The "EZ Install" version - init, build, start, preview
# Note that this uses the default targets -- which are least disruptive (to production)
# and most experimental (development ui, ci services)
run: init build start pause preview

NODE=$(shell node --version 2> /dev/null)
NODE_REQUIRED="v6"
majorver=$(word 1, $(subst ., ,$1))

preconditions:
	@echo "> Testing for preconditions."
	@echo $(if $(findstring $(call majorver, $(NODE)), $(NODE_REQUIRED)), "Good node version ($(NODE))", $(error "! Node major version must be $(NODE_REQUIRED), it is $(NODE).") )


# Initialization here pulls in all dependencies from Bower and NPM.
# This is **REQUIRED** before any build process can proceed.
# bower install is not part of the build process, since the bower
# config is not known until the parts are assembled...

install_tools:
	@echo "> Installing build and test tools."
	npm install
	cd tools/server; npm install
	-mkdir dev/tools
	cp tools/link.sh dev/tools
	$(GRUNT) init

init: preconditions install_tools


# Perform the build. Build scnearios are supported through the config option
# which is passed in like "make build config=ci"
build:
	@echo "> Building."
	cd mutations; node build $(config)

build-ci:
	@echo "> Building for CI."
	cd mutations; node build ci

# Build the docker image, assumes that make init and make build have been done already

docker_image: build-ci
	@echo "> Building docker image for this branch."
	@echo "> Cleaning out old contents"
	rm -rf $(CI_DOCKER_CONTEXT)/contents
	@echo "> Copying current build of kbase-ui into contents..."
	# We create 2 directories, one with non-minified js and one with minified js
	mkdir -p $(CI_DOCKER_CONTEXT)/contents/services/kbase-ui-dev
	mkdir -p $(CI_DOCKER_CONTEXT)/contents/services/kbase-ui
	# Note that we copy the "build" build for dev, dist build for normal
	cp -pr build/build/client/* $(CI_DOCKER_CONTEXT)/contents/services/kbase-ui-dev
	cp -pr build/dist/client/* $(CI_DOCKER_CONTEXT)/contents/services/kbase-ui
	@echo "> Copying kb/deployment templates..."
	cp -pr $(CI_DOCKER_CONTEXT)/../kb-deployment/* $(CI_DOCKER_CONTEXT)/contents
	@echo "> Beginning docker build..."
	cd $(TOPDIR)/deployment/; bash tools/build_docker_image.sh

# run-dev-image:
# 	@echo "> Running dev image."
# 	# @echo "> You will need to inspect the docker container for the ip address "
# 	# @echo ">   set your /etc/hosts for ci.kbase.us accordingly."
# 	@echo "> To map host directories into the container, you will need to run "
# 	@echo ">   deploymnet/dev/tools/run-image.sh with appropriate options."
# 	$(eval cmd = $(TOPDIR)/deployment/dev/tools/run-image.sh $(env))
# 	@echo "> Issuing: $(cmd)"
# 	bash $(cmd)

run-image:
	@echo "> Running image."
	# @echo "> You will need to inspect the docker container for the ip address "
	# @echo ">   set your /etc/hosts for ci.kbase.us accordingly."
	@echo "> With options:"
	@echo "> plugins $(plugins)"
	@echo "> internal $(internal)"
	@echo "> libraries $(libraries)"
	@echo "> To map host directories into the container, you will need to run "
	@echo ">   deploymnet/dev/tools/run-image.sh with appropriate options."
	$(eval cmd = $(TOPDIR)/deployment/tools/run-image.sh dev $(foreach p,$(plugins),-p $(p)) $(foreach i,$(internal),-i $i) $(foreach l,$(libraries),-l $l))
	@echo "> Issuing: $(cmd)"
	bash $(cmd)

# Set up a development environment.
# Installs tools into kbase-ui/dev. These tools are ignored by git,
# so may safely be modified by the developer. They are important but not
# required by the dev process. More in the docs.
devinit:
	cd mutations; node setup-dev


start:
	@echo "> Starting preview server."
	@echo "> (make stop to kill it)"
	cd tools/server; node server start $(config) $(directory)&

pause:
	@echo "> Pausing to let the server start up."
	sleep 5

stop:
	@echo "> Stopping the preview server."
	cd tools/server; node server stop  $(config)

# Run the server, and open a browser pointing to it.
preview:
	@echo "> Launching default browser for preview"
	cd tools/server; node server preview $(config)


# Tests are managed by grunt, but this also mimics the workflow.
#init build
unit-tests:
	$(KARMA) start test/unit-tests/karma.conf.js

travis-tests:
	$(GRUNT) test-travis


test: unit-tests

test-travis: unit-tests travis-tests


# Clean slate
clean:
	$(GRUNT) clean-all

clean-temp:
	$(GRUNT) clean:temp

# If you need more clean refinement, please see Gruntfile.js, in which you will
# find clean tasks for each major build artifact.

# Eventually, if docs need to be built, the process will go here.
docs: init
	@echo docs!

.PHONY: all test build
