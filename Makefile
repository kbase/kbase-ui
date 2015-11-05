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

# set this to use different deploy-*.cfg files (deploy-ci, deploy-prod, etc)
TARGET			= ci
PACKAGE			= ui-common
TOPDIR			= $(PWD)
DISTLIB			= $(TOPDIR)/build
DOCSLIB			= $(TOPDIR)/docs
DEPLOY_CFG		= deploy-$(TARGET).cfg
KB_TOP			= /kb

# Standard 'all' target = just do the standard build
all: init build

# See above for 'all' - just running 'make' should locally build
default: init build

# Initialization here pulls in all dependencies from Bower and NPM.
# This is **REQUIRED** before any build process can proceed.
init:
	@ bower install --allow-root
	@ npm install

# Perform the build.
# The actual build step is done by grunt. This also sets up the 
# configuration in the build target. That configuration mainly
# deals with filling out templated URL targets based on deployment
# location (prod vs. next vs. CI vs. local)
build:
	@ grunt build
	@ node tools/process_config.js $(DEPLOY_CFG)

# The deployment step uses grunt to, essentially, copy the build
# artifacts to the deployment directory
deploy:
	@ grunt deploy

# Tests are managed by grunt, but this also mimics the workflow.
test: init build
	@ grunt test

# Cleans up build artifacts without removing required libraries
# that get installed through Bower or NPM.
clean:
	@ rm -rf $(DISTLIB)

# Cleans out all required libraries and packages.
reqs-clean: clean
	@ rm -rf node_modules/
	@ rm -rf bower_components/

# Eventually, if docs need to be built, the process will go here.
docs: init
	@echo docs!

.PHONY: all