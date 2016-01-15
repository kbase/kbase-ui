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
GRUNT		        = ./node_modules/.bin/grunt
KARMA			= ./node_modules/.bin/karma

# Standard 'all' target = just do the standard build
all: init build

# See above for 'all' - just running 'make' should locally build
default: init build ci

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
	$(GRUNT) init
	
# Perform the build. Build scnearios are supported through the config option
# which is passed in like "make build config=ci"
build:	
	cd mutations; node build $(config)

# The deploy step will copy the files according to the instructions in the deploy
# config. See mutations/deploy.js for details.
#deploy:	
#	cd mutations; node build deploy; node deploy
	
# Set up a development environment. 
# Installs tools into kbase-ui/dev. These tools are ignored by git,
# so may safely be modified by the developer. They are important but not 
# required by the dev process. More in the docs.
devinit:
	cd mutations; node setup-dev
	

start:
	cd tools/server; node server start $(target) &

stop: 
	cd tools/server; node server stop 

# Run the server, and open a browser pointing to it.
preview:
	cd tools/server; node server preview
	

# Tests are managed by grunt, but this also mimics the workflow.
#init build
test:
	$(KARMA) start test/karma.conf.js
	

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
