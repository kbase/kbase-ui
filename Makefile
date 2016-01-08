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

# Standard 'all' target = just do the standard build
all: init build

# See above for 'all' - just running 'make' should locally build
default: init build

# The "EZ Install" version - init, build, start, preview
# Note that this uses the default targets -- which are least disruptive (to production)
# and most experimental (development ui, ci services)
run: init build start preview
	

# Initialization here pulls in all dependencies from Bower and NPM.
# This is **REQUIRED** before any build process can proceed.
# bower install is not part of the build process, since the bower
# config is not known until the parts are assembled...
init:
	npm install
	cd tools/server; npm install
	grunt init

# Perform the build.
# The actual build step is done by grunt. This also sets up the 
# configuration in the build target. That configuration mainly
# deals with filling out templated URL targets based on deployment
# location (prod vs. next vs. CI vs. local)
#@ grunt build-dist --target $(TARGET)
#  --deploy-config $(TARGET)
# @ node tools/process_config.js $(DEPLOY_CFG)
build:	
	cd mutations; node build
	
# Set up a development environment. 
# Installs tools into kbase-ui/dev. These tools are ignored by git,
# so may safely be modified by the developer. They are important but not 
# required by the dev process. More in the docs.
devinit:
	cd mutations; node setup-dev
	

start:
	cd tools/server; node server start &

stop: 
	cd tools/server; node server stop 

# Run the server, and open a browser pointing to it.
preview:
	cd tools/server; node server preview
	
dist: 
	cd mutations; node build prod prod

# The deploy step will copy the files according to the instructions in the deploy
# config. See mutations/deploy.js for details.
deploy:	
	cd mutations; node deploy

# Tests are managed by grunt, but this also mimics the workflow.
#init build
test:
	karma start test/karma.conf.js
	

# Cleans up build artifacts without removing required libraries
# that get installed through Bower or NPM.
clean:
	@ grunt clean-dist

# Cleans out all required libraries and packages.
reqs-clean: clean
	@ rm -rf node_modules/
	@ rm -rf bower_components/

# Eventually, if docs need to be built, the process will go here.
docs: init
	@echo docs!

.PHONY: all test build
