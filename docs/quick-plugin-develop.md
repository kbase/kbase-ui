
# Quick Guide to Plugin KBase UI Plugin Development

Setting up and working on an existing plugin within kbase-ui.

> Note this is for working on an *existing* plugin -- it does not cover creation of a plugin from scratch

## Set Up the Dev directory

It is good to do all of this in a dedicated directory, since you will be cloning two or more repos side by side. kbase-ui also uses a temporary directory (named *temp*) which by default is located in the directory above the repo.

## Install kbase-ui

First, you need to get *kbase-ui* at [https://gitub.com/kbase/kbase-ui]() and ensure that you are set up and able to do the basic build and preview. 


> Of course, if you will be making changes to kbase-ui itself which need to be propagated back to the project, you should clone your own fork.

The *kbase-ui* repo contains seminal documentation; especially relevant is the *quick-deploy.md* description of a standard production deployment of the ui, and *prerequisites* for the build environment. 

The developer deployment differs from the production deploy, although the production deploy is a part of the development workflow (specifically, testing before a pull request is issued.)

In short, the developer build process is:

```
git clone -b develop https://github.com/kbase/kbase-ui
cd kbase-ui
make init
make build
make start
make preview
```

This sets up the build environment, builds a developer version of the ui, starts a little static nodejs server at on :8080, and launches the default browser pointed at that local server.

The basic process is then to iterate over

- edit
- make build
- refresh browser

## Install the Plugin

Clone your fork of the plugin alongside kbase-ui

```
git clone https://github.com/YOU/kbase-ui-plugin-PLUGIN
```

## Integrate the Plugin into kbase-ui

A plugin can be developed in two modes: slow or fast.

In slow mode, you can simply update a plugin in-situ, push your changes up to your repo, and configure the local kbase-ui to use the tip if your master branch rather than fetch it through bower's semver mechanism. This is slow (sans automation) because it each plugin change must be followed by commit and push of the plugin repo, then a build of kbase-ui.

In fast mode, you will link your plugin directly into a kbase-ui build. Your changes will be instantly available to the kbase-ui filesystem without any additional build process (after the first time). It does require a little more configuration at the beginning, but that is a small price to pay for an extended session.

One advantage of at least getting familiar with slow mode is that it can also be applied to other scenarios, such as using another developer's fork, or a special branch or tag from upstream, for testing

#### Create Dev Config

In *kbase-ui*, the top level *config* directory contains all of the configuration for the ui, service end points, and the build process. For a stock build (e.g. ci, next, production) the config directory is consulted by the make file and sub-processes. For development, it is usually required to make some small changes to the configuration. Rather than change the built-in configuration, the build process will first look in the top level *dev* directory for *dev/config*. 

So the first step is to copy the config directory into the dev directory

```
cd kbase-ui
cp -pr config dev
```
We won't be modifying any configuration immediately.


### Integrate into the build

If this is an existing plugin which is part of the production and dev kbase-ui builds, no additional work is required, and this document will not cover adding a plugin to the build. But let's review where the configuration exists.

It is located in the ui build configuration, which is located in [dev/]config/ui/dev/build.yml and [dev/]config/ui/prod/build.yml. If it is a development-only plugin, it will only be located in [dev/]config/ui/dev/build.yml; otherwise it will be located in both.

The entry will look like this:

```
    -
        name: PLUGIN
        globalName: kbase-ui-plugin-PLUGIN
        version: 1.2.3
        cwd: src/plugin
        source:
            bower: {}
```

### Slow Mode

Slow mode just piggybacks on the canonical build mechanism, with a tweak to the build config to point bower to a specific branch or tag in your fork.

- create dev config
- update dev config
- issues

[ to do ]

### Fast Mode

Fast mode links your plugin into the build directory so that you are coding live into a runnable kbase-ui.

- create dev config
- create links.sh script
- set up first build
- issues


#### Create links.sh

Within the config directory is a sample *links.sh* file. This is a simple shell script which, when run, should link your plugin into the kbase-ui build. It contains samples, commented out, for linking plugins and library modules into the kbase-ui build.

You will want to uncomment the external plugin and modify it to fit your PLUGIN name and the DEVDIR into which you have installed kbase-ui and the plugin repo. The PLUGIN name should be the same as in the package.name property of the plugin's config.yml. It will also be the same as the name property used in the build config which brings the plugin into the ui.

```
#
# EXTERNAL PLUGINS
#

# An external plugin is one that is installed into kbase-ui from bower during the build process. None of the code, other than 
# configuration for the bower package name and version, resides in KBase.
# To link it into the build, you want to grag the src/plugin directory within it and point it to biuld/build/client/modules/plugins/PLUGIN
# The build process performs no special transformations on the plugin
# 


rm -rf ../../build/build/client/modules/plugins/PLUGIN
ln -s /DEVDIR/kbase-ui-plugin-PLUGIN/src/plugin ../../build/build/client/modules/plugins/PLUGIN
```

#### Build kbase-ui with the linked plugin

This handy line will do the trick

```
make build; cd dev/config; sh link.sh; cd ../..
```

After running this, the UI build will be ready for hacking up on the plugin.

#### Final steps

Finally, fire up the dev server and point your browser to it:

```
make start
make preview
```


## Testing the real build

After you've worked through a set of changes to the plugin you are ready to tie
up a release, even for testing progress so far.

- commit and push up the changes
- update the dev build config
- build 
- test

## Preparing for release

A release ready for CI will require a small change to the kbase-ui configuration and a merge to the upstream repo. However, before issuing a pull request, you will want to test the changes you have made.