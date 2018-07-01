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
config			= 

# The kbase-ui build folder to use for the docker image.
# values: build, dist
# Defaults to dist 
# For local development, one would use the build, since is much faster 
# to create. A debug build may be available in the future.
build           = 

# The deploy environment; used by dev-time image runners
# dev, ci, next, appdev, prod
# Defaults to dev, since it is only useful for local dev; dev is really ci.
# Causes run-image.sh to use the file in deployment/conf/$(env).env for
# "filling out" the nginx and ui config templates.
# TODO: hook into the real configs out of KBase's gitlab
env             = 

# The custom docker network
net 			= kbase-dev


DEV_DOCKER_CONTEXT	= $(TOPDIR)/deployment/dev/docker/context
CI_DOCKER_CONTEXT	= $(TOPDIR)/deployment/ci/docker/context
PROD_DOCKER_CONTEXT	= $(TOPDIR)/deployment/prod/docker/context

# functions
# thanks https://stackoverflow.com/questions/10858261/abort-makefile-if-variable-not-set
check_defined = \
    $(strip $(foreach 1,$1, \
        $(call __check_defined,$1,$(strip $(value 2)))))
__check_defined = \
    $(if $(value $1),, \
        $(error Undefined $1$(if $2, ($2))$(if $(value @), \
                required by target `$@')))

.PHONY: all test build docs

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
NODE_REQUIRED="v8"
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

node_modules:
	@echo "> Installing build and test tools."
	npm install

setup: preconditions setup-dirs

init: setup node_modules


# Perform the build. Build scnearios are supported through the config option
# which is passed in like "make build config=ci"
build: clean-build
	@echo "> Building."
	cd mutations; node build $(config)

build-deploy-configs:
	@echo "> Building Deploy Configs..."
	@mkdir -p $(TOPDIR)/build/deploy/configs
	@cd mutations; node build-deploy-configs $(TOPDIR)/deployment/ci/docker/kb-deployment/conf/config.json.tmpl $(TOPDIR)/config/deploy $(TOPDIR)/build/deploy/configs
	@echo "> ... deploy configs built in $(TOPDIR)/build/deploy/configs"

docker-network:
	@:$(call check_defined, net, "the docker custom network: defaults to 'kbase-dev'")
	bash tools/docker/create-docker-network.sh $(net)

# $(if $(value network_exists),$(echo "exists"),$(echo "nope"))


# Build the docker image, assumes that make init and make build have been done already
docker-image: 
	@:$(call check_defined, build, "the build configuration: dev ci prod")
	@echo "> Building docker image for this branch."
	bash $(TOPDIR)/tools/docker/build-image.sh $(build)

# The dev version of run-image also supports cli options for mapping plugins, libraries, 
# and parts of ui into the image for (more) rapdi development workflow
run-docker-image-dev: docker-network
	@echo "> Running kbase-ui image."
	# @echo "> You will need to inspect the docker container for the ip address "
	# @echo ">   set your /etc/hosts for ci.kbase.us accordingly."
	@echo "> With options:"
	@echo "> plugins $(plugins)"
	@echo "> internal $(internal)"
	@echo "> libraries $(libraries)"
	@echo "> To map host directories into the container, you will need to run "
	@echo ">   tools/run-image.sh with appropriate options."
	$(eval cmd = $(TOPDIR)/tools/docker/run-image-dev.sh $(env) \
	  $(foreach p,$(plugins),-p $(p)) \
	  $(foreach i,$(internal),-i $i) \
	  $(foreach l,$(libraries),-l $l) \
	  $(foreach s,$(services),-s $s)  \
	  $(foreach d,$(data),-d $d) \
	  $(foreach f,$(folders),-f $f) \
	  $(foreach v,$(env_vars),-v $v) \
	  -y "$(dynamic_service_proxies)")
	@echo "> Issuing: $(cmd)"
	bash $(cmd)

run-docker-image: docker-network
	@:$(call check_defined, env, "the deployment environmeng: dev ci next appdev prod)
	@:$(call check_defined, net, "the docker custom network: defaults to 'kbase-dev'")
	@echo "> Running kbase-ui image."
	# @echo "> You will need to inspect the docker container for the ip address "
	# @echo ">   set your /etc/hosts for ci.kbase.us accordingly."
	$(eval cmd = $(TOPDIR)/tools/docker/run-image-dev.sh $(env) $(net))
	@echo "> Issuing: $(cmd)"
	bash $(cmd)

docker-clean:
	@:$(call check_defined, net, "the docker custom network: defaults to 'kbase-dev'")
	bash tools/docker/clean-docker.sh


uuid:
	@node ./tools/gen-uuid.js

# Tests are managed by grunt, but this also mimics the workflow.
#init build
unit-tests:
	$(KARMA) start test/unit-tests/karma.conf.js

integration-tests:
	@:$(call check_defined, host, first component of hostname)
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

node_modules: init

docs:
	cd docs; \
	npm install; \
	./node_modules/.bin/gitbook build ./book

docs-viewer: docs
	cd docs; \
	(./node_modules/.bin/wait-on -t 10000 http://localhost:4000 && ./node_modules/.bin/opn http://localhost:4000 &); \
	./node_modules/.bin/gitbook serve ./book

