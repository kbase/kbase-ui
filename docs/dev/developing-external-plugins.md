# Developing kbase-ui Plugins

This guide describes a workflow for developing kbase-ui plugins, and deploying plugin and kbase-ui updates.

> Note this is for working on an *existing* plugin -- it does not cover creation of a plugin from scratch. See  [new external plugin](developing-new-external-plugin.md) if you need to create a new plugin.

## Contents 
- Prerequisites
- Setting Up
- Linking into kbase-ui
- Deploying updated plugin
- Integrating into kbase-ui
- Deploying updated kbase-ui

## Prerequisites

This guide does not cover setting up kbase-ui for development -- if you have not done that yet please see the following documents:

1. [Prerequisites](prerequisites.md)
2. [Getting Started](getting-started.md)

## Setting Up

Good, now that you have set up a kbase-ui development environment, it is time to integrate a plugin to work on.

### Fork the Plugin Repo

If you haven't yet, now is the time to fork the plugin repo at github.

All kbase plugins have an upstream repo in the kbase github account at ```https://github.com/kbase/kbase-ui-plugin-THEPLUGIN```.

Where ```THEPLUGIN``` is the name of the plugin.

> Well,sometimes during initial development, a plugin may reside at your personal repo. This saves the extra pull request step which can slow down iterative development, especially when a plugin is being born. This only works well when you are the sole developer

Note that all plugin repos are prefixed with ```kbase-ui-plugin-```. This is not a hard requirement, in that kbase-ui can use plugins named otherwise. However some kbase-ui build tools assume this naming convention, and it is good practice for a few reasons:

- it creates a uniqe name in the *github* namespace
- it createsa a unique name in the *bower* namespace (more on that later)
- it makes it easier to manage plugins in your project (they appear together in directory listings)

When we reference the *name* of a plugin, we always refer the the string occuring after the *kbase-ui-plugin-* prefix.

So, your task is to fork the repo you are interested in.

- create a github account if you do not already have one
- sign in to github if you are not already and ensure you are using the correct account for kbase work
- visit the github page for the plugin
    - the root page for all plugins is https://github.com/kbase
- fork the repo into your github account using the fork button


### Clone the Plugin Repo

We'll clone the plugin repo using the same method used for setting up kbase-ui for development.

First, open a terminal in the top level ```dev``` directory you set up to contain the kbase-ui repo.

Then we'll clone the canonical plugin repo in the kbase account.

```bash
$ cd ~/work/dev
$ git clone https://github.com/kbase/kbase-ui-plugin-PLUGINNAME
```

Then add a remote which is your fork of the repo.

```bash
$ cd kbase-ui-plugin-PLUGINNAME
$ git remote add NICKNAME https://github.com/YOURACCOUNT/kbase-ui-plugin-PLUGINNAME
```

This sets up a remote named *NICKNAME* which points to your fork using the https method.

If you want to avoid the need to enter your password every time you push changes back up to your account, you may want to set up an ssh key:

[https://help.github.com/articles/connecting-to-github-with-ssh/]().

If you have an ssh key for your current machine established for your github account, the clone command would look like

```
$ git remote add NICKNAME ssh://git@github.com/YOURACCOUNT/kbase-ui-plugin-PLUGINNAME
```
 
 In either event, you have now established the plugin as a sister directory to kbase-ui. Your development directory should now look like:
 
 ```
 dev
    kbase-ui
    kbase-ui-plugin-PLUGINNAME
 ```

### Build and run the image with the plugin linked

A tool is provided to both run the kbase-ui image (container) and at the same time link the local plugin directly into the image. Once you have done this, changes made to the local plugin will be relfected immediately in kbase-ui (after a browser reload.)

This works by mounting the plugin source directory to the corresponding location inside of the kbase-ui container. The docker-mounted directory will temporarily replace the directory which was installed when kbase-ui was built.

```bash
cd ~/work/dev/kbase-ui
make build
make dev-image
bash deployment/dev/tools/run-image.sh dev -p MYPLUGIN
```

The tool we are running is ```run-image.sh``. 

Here is the usage output:

```bash
Usage: run-image.sh env [-p external-plugin] [-i internal-plugin] [-l lib-module-dir:lib-name:source-path]'
```

You should see a successful startup of the docker container, with log lines printed into the console.

#### env argument

The first argument to run-image is the ```env``. This value corresponds to the corresponding deployment config file located in deployment/conf. Since we are supplying "dev", we will be using the deploy file "deployment/conf/dev.ini".

#### -p argument

We are using the -p argument to specify an external plugin to link into the kbase-ui image. Note that we use the plugin name, not the repo name. The tool knows how to find the plugin directory based on the directory structure (it should be a sister directory to kbase-ui) and uniform naming structure for repos (kbase-ui-plugin-PLUGINNAME).

### Example

```bash
bash /Users/erikpearson/work/kbase/sprints/2018Q1S1/kbase-ui/deployment/dev/tools/run-image.sh dev
CONFIG MOUNT: /Users/erikpearson/work/kbase/sprints/2018Q1S1/kbase-ui/deployment/conf
ENVIRONMENT : dev
READING OPTIONS
MOUNTS:
BusyBox v1.26.2 (2017-11-23 08:40:54 GMT) multi-call binary.

Usage: dirname FILENAME

Strip non-directory suffix from FILENAME
NGINX CONFIG TEMPLATE /kb/deployment/bin/../conf/deployment_templates/nginx.conf.j2
DATA SRC /conf/dev.ini
CONFIG TEMPLATE /kb/deployment/bin/../conf/deployment_templates/config.json.j2
2018/01/03 23:45:01 [notice] 13#13: using the "epoll" event method
2018/01/03 23:45:01 [notice] 13#13: nginx/1.12.2
2018/01/03 23:45:01 [notice] 13#13: OS: Linux 4.9.60-linuxkit-aufs
2018/01/03 23:45:01 [notice] 13#13: getrlimit(RLIMIT_NOFILE): 1048576:1048576
2018/01/03 23:45:01 [notice] 13#13: start worker processes
2018/01/03 23:45:01 [notice] 13#13: start worker process 14
2018/01/03 23:45:01 [notice] 13#13: start worker process 15
2018/01/03 23:45:01 [notice] 13#13: start worker process 16
2018/01/03 23:45:01 [notice] 13#13: start worker process 17
```

> TODO: provide a make task for this

Confirm that this works by pulling up your favorite browser to https://ci.kbase.us.

## Develop!

You may now make changes to the plugin, and see those changes reflected immediately upon refreshing the browser.


## More sections to be written for external plugin development

- testing changes for all environments
- pr, merge, tagging plugin
- local testing again with new version
- pr, merge ui changes (just config)
- redeploy on CI

## Deploying updated plugin

When you have completed a round of changes to the plugin and it is ready for review on CI, you will need to update the plugin repo and issue the changes into the CI environment. Typically this will involve two sets of updates -- first a PR for your plugin changes, which results in a new version; secondly a PR for the new plugin version in kbase-ui, which will result in a new release in CI.

- commit all changes
- push changes to your fork
- issue a PR for the kbase plugin
- after the PR is accepted, a new version will have been issued
- update the plugin version in your kbase-ui plugins.yml config for both dev and ci (and prod if this is ready for release)
- rebuild kbase-ui and verify that the build works, and that the changes are present
- commit and push your kbase-ui changes (which will just be configuration changes to bump up the version for your plugin) to your kbase-ui fork
- issue a PR for this change
- the PR will be accepted and kbase-ui will be redeployed into CI

> If the PR is in the early stages, it may still be in your personal github account; if this is so clearly you can skip the PR process for the plugin, and issue the new release version yourself.

---

[Index](index.md) - [README](../README.md) - [Release Notes](../release-notes/index.md) - [KBase](http://kbase.us)

---


