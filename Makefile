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
# dev, prod
# Defaults to prod
config			= prod

# The kbase-ui build folder to use for the docker image.
# values: build, dist
# Defaults to dist 
# For local development, one would use the build, since is much faster 
# to create. A debug build may be available in the future.
build           = dist

# The deploy environment; used by dev-time image runners
# dev, ci, next, appdev, prod
# Defaults to dev, since it is only useful for local dev; dev is really ci.
# Causes run-image.sh to use the file in deployment/conf/$(env).env for
# "filling out" the nginx and ui config templates.
# TODO: hook into the real configs out of KBase's gitlab
env             = dev


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

setup-dirs:
	@echo "> Setting up directories."
	mkdir -p temp/files

install-tools:
	@echo "> Installing build and test tools."
	npm install

init: preconditions setup-dirs install-tools


# Perform the build. Build scnearios are supported through the config option
# which is passed in like "make build config=ci"
build: clean-build
	@echo "> Building."
	cd mutations; node build $(config)

build-ci:
	@echo "> Building for CI."
	cd mutations; node build ci

# Build the docker image, assumes that make init and make build have been done already

image: build-docker-image

docker_image: build-docker-image

build-docker-image:
	@echo "> Building docker image for this branch."
	@echo "> Cleaning out old contents"
	rm -rf $(CI_DOCKER_CONTEXT)/contents
	@echo "> Copying dist build of kbase-ui into contents..."
	mkdir -p $(CI_DOCKER_CONTEXT)/contents/services/kbase-ui
	cp -pr build/$(build)/client/* $(CI_DOCKER_CONTEXT)/contents/services/kbase-ui
	@echo "> Copying kb/deployment templates..."
	cp -pr $(CI_DOCKER_CONTEXT)/../kb-deployment/* $(CI_DOCKER_CONTEXT)/contents
	@echo "> Beginning docker build..."
	cd $(TOPDIR)/deployment/; bash tools/build_docker_image.sh

# The dev version of run-image also supports cli options for mapping plugins, libraries, 
# and parts of ui into the image for (more) rapdi development workflow
run-image:
	@echo "> Running kbase-ui image."
	# @echo "> You will need to inspect the docker container for the ip address "
	# @echo ">   set your /etc/hosts for ci.kbase.us accordingly."
	@echo "> With options:"
	@echo "> plugins $(plugins)"
	@echo "> internal $(internal)"
	@echo "> libraries $(libraries)"
	@echo "> To map host directories into the container, you will need to run "
	@echo ">   deploymnet/tools/run-image.sh with appropriate options."
	$(eval cmd = $(TOPDIR)/deployment/tools/run-image.sh $(env) $(foreach p,$(plugins),-p $(p)) $(foreach i,$(internal),-i $i) $(foreach l,$(libraries),-l $l) $(foreach s,$(services),-s $s))
	@echo "> Issuing: $(cmd)"
	bash $(cmd)

# The proxier, for local dev support

proxier-image:
	@echo "> Building docker image."
	@echo "> Cleaning out old contents"
	rm -rf $(PROXIER_DOCKER_CONTEXT)/contents
	mkdir -p $(PROXIER_DOCKER_CONTEXT)/contents
	@echo "> Copying kb/deployment config templates..."
	cp -pr $(PROXIER_DOCKER_CONTEXT)/../src/* $(PROXIER_DOCKER_CONTEXT)/contents
	@echo "> Beginning docker build..."
	cd $(PROXIER_DOCKER_CONTEXT)/../..; bash tools/build_docker_image.sh

run-proxier-image:
	$(eval cmd = $(TOPDIR)/deployment/proxier/tools/run-image.sh $(env))
	@echo "> Running proxier image"
	@echo "> with env $(env)"
	@echo "> Issuing: $(cmd)"
	bash $(cmd)		

# Tests are managed by grunt, but this also mimics the workflow.
#init build
unit-tests:
	$(KARMA) start test/unit-tests/karma.conf.js

integration-tests:
	$(GRUNT) integration-tests --host=$(host)

travis-tests:
	$(GRUNT) test-travis

test: unit-tests

test-travis: unit-tests travis-tests


# Clean slate
clean:
	$(GRUNT) clean-all

clean-temp:
	$(GRUNT) clean:temp

clean-build:
	$(GRUNT) clean-build

# If you need more clean refinement, please see Gruntfile.js, in which you will
# find clean tasks for each major build artifact.

# Eventually, if docs need to be built, the process will go here.
docs: init
	@echo docs!

.PHONY: all test build
