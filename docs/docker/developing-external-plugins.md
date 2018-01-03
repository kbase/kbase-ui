# Developing kbase-ui Plugins

This guide covers a developer workflow for developing kbase-ui plugins, and deploying plugin and kbase-ui updates.

> Note this is for working on an *existing* plugin -- it does not cover creation of a plugin from scratch. See  [new external plugin](developing-new-external-plugin.md) if you need to create a new plugin.

- Prerequisites
- Setting Up
- Linking into kbase-ui
- Deploying updated plugin
- Integrating into kbase-ui
- Deploying updated kbase-ui

## Prerequisites

This guide does not cover setting up kbase-ui for development -- if you have not done that yet please see the following documents:

(1) [Prerequisites](prerequisites.md)
(2) [Getting Started](getting-started.md)

## Setting Up

Good, now that you have set up a kbase-ui development environment, it is time to integrate a plugin to work on.

### Fork the Plugin Repo

If you haven't yet, now is the time to fork the plugin repo at github.

All kbase plugins have an upstream repo in the kbase github account at ```https://github.com/kbase/kbase-ui-plugin-THEPLUGIN```.

Where ```THEPLUGIN``` is the name of the plugin.

> Note that sometimes during initial rapid development, a plugin may reside at your personal repo. This saves the extra pull request step which can slow down iterative development. This only works well when you are the sole developer

Note that all plugin repos are prefixed with ```kbase-ui-plugin-```. This is not strictly a requirement, although some kbase-ui build tools will assume this, but it is good practice for a few reasons:

- it creates a uniqe name in the *github* namespace
- it createsa a unique name in the *bower* namespace (more on that later)
- it makes it easier to manage plugins in your project (they appear together in directory listings)

When we reference the *name* of a plugin, we always refer the the string occuring after the *kbase-ui-plugin-* prefix.

So, your task is to fork the repo you are interested in.

- create a github account if you do not already have one
    - if you are a kbase staff member and you already have a github account, you may wish to create a kbase account distinct from your other identity on github
- sign in to github if you are not already and ensure you are using the correct account for kbase work
- visit the github page for the plugin
    - the root page for all plugins is https://github.com/kbase
- fork the repo into your github account using the fork button


### Clone the Plugin Repo

We'll clone the plugin repo using the same method used for setting up kbase-ui for development.

First, open a terminal in the top level ```dev``` directory you set up to contain the kbase-ui repo.

Then we'll clone the canonical plugin repo in the kbase account.

```bash
$ git clone https://github.com/kbase/kbase-ui-plugin-PLUGINNAME
```

Then add a remote which is your fork of the repo.

```bash
$ git remote add NICKNAME https://github.com/YOURACCOUNT/kbase-ui-plugin-PLUGINNAME
```

This sets up a remote named NICKNAME which points to your fork using the https method.

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
        ...
    kbase-ui-plugin-PLUGINNAME
        ...
 ```

### An aside: how plugins are built into kbase-ui

In the kbase-ui build configuration, there exists a configuration file listing all of the plugins to be built into the kbase-ui web app. This configuration file specifies the plugin name, the location and the version. 

The entry will look like this:

```
    -
        name: PLUGINNAME
        globalName: kbase-ui-plugin-PLUGINNAME
        version: 1.2.3
        cwd: src/plugin
        source:
            bower: {}
```

During the kbase-ui build process, the build tool uses the *bower* package manager to locate and download the correct version of the plugin source from github and install it locally. The build tool then copies the src/plugin/modules directory into the kbase-ui modules/plugins directory, and uses the src/plugin/config.yml file to integrate plugin components into the ui.

Now, you may be able to see that one way to develop plugins is to simply update the plugin source, merge it into the repo, update the repo version, and rebuild kbase-ui. That is the short version of the steps necessary to integrate a plugin change! Although these steps are necessary for a well-managed system, it would be a  slow way to incrementally develop a plugin (although you can imagine a set of tools to automate it.)

So, at develop-time, an alternative method is used. Since during the kbase-ui build process the plugin ```src/plugin/module``` directory is simply copied, whole-cloth, into the kbase-ui built source tree, we can simply alter the kbase-ui build to point to our local src/plugin/module rather than the installed one.

In the old development workflows, the installed plugin would be removed and the local development directory linked into the build. In the current docker-based workflow, we use the docker run mount options to perform a similar function. Fortunately this is wrapped within the 'run-image.sh' tool 

### Run the image with the plugin linked

A tool is provided to both run the image (container) and at the same time link the locally cloned plugin directly into the image. This works by mounting the plugin source directory to the corresponding location inside of the kbase-ui container. The docker-mounted directory will temporarily replace the directory which was installed when kbase-ui was built.

```bash
cd ~/work/dev/kbase-ui
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

*** UPDATED ***




## Deploying updated plugin

[ to be done ]
[ this section will describe how to get your updated plugin back into the home repo and to increment the version]

### Updating your repo

### The pull request

### The version bump

## Integrating into  kbase-ui

[ to be done]
[ with an updated plugin, time to integrate it back into kbase-ui and ensure it works ]

### Updating plugins configurations

### Test each build

## Deploying updated kbase-ui

[ to be done ]
[ with an updated kbase ui, time to get that back into the home repo and up on ci ]

### Commit changes and push up to your fork

### Pull Request to the main repo



### Testing your PR
 
> TO BE DONE

