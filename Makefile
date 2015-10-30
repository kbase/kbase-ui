PACKAGE  	   = ui-common
TOPDIR   	   = $(PWD)
DISTLIB  	   = $(TOPDIR)/build
DOCSLIB  	   = $(TOPDIR)/docs
TARGET   	   = prod
KB_TOP		   = /kb

all: init build

default: init build

init:
	@ bower install --allow-root
	@ npm install

build:
	@ grunt build
	@ node tools/process_config.js deploy-ci.cfg

deploy:
	@ grunt deploy

test: init
	@ grunt test

clean:
	@ rm -rf $(DISTLIB)

dist-clean: clean
	@ rm -rf node_modules/
	@ rm -rf bower_components/

docs: init
	@echo docs!

.PHONY: all