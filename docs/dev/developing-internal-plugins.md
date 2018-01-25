



# Developing kbase-ui Plugins

This guide covers a developer workflow for developing kbase-ui plugins, and deploying plugin and kbase-ui updates.

> Note this is for working on an *existing* plugin -- it does not cover creation of a plugin from scratch


- Prerequisites
- Setting Up
- Linking into kbase-ui
- Deploying updated plugin
- Integrating into kbase-ui
- Deploying updated kbase-ui

## Prerequisites

This guide does not cover setting up kbase-ui for development -- if you have not done that yet please see the following documents:

(1) [prerequisites.md](Prerequisites)
(2) [developing-kbase-ui.md](Developing with kbase-ui)

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

Testing the PR can take place alongside the development stuff, taking advantage of the vm and proxy that are already set up.

All this should be done in the vm, so open up a terminal in the vm if you don't have one already.

```
vagrant ssh
```

#### Ensure that the vm has the required kbase-ui dev dependencies:

```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

#### Set up testing directory and clone repos

In the /vagrant directory, create a directory pr-testing

```
cd /vagrant
mkdir pr-testing
```

In this directory, clone the plugin and kbase-ui from the kbase account at github:

```
git clone -b develop https://github.com/kbase/kbase-ui
git clone https://github.com/kbase/kbase-ui-plugin-MYPLUGIN
```

In the plugin directory fetch the pull request 123 into a branch:

```
git fetch origin pull/123/head:test-123
git checkout test-123
```

#### Set up kbase-ui to use a local plugin directory 

Configure the build to use the local plugin for the build

```
cd kbase-ui
vi config/ui/ci/build.yml
```

in the section for the plugin change the source:

```
    -
        name: dataview
        globalName: kbase-ui-plugin-dataview
        version: 3.1.6
        cwd: src/plugin
        source:
            bower: {}
```

to this

```
    -
        name: dataview
        globalName: kbase-ui-plugin-dataview
        version: 3.1.6
        cwd: src/plugin
        source:
            directory: {}
```

> Note: be sure to preserve spaces and not use tabs; otherwise you will get a yaml error during the build

Build kbase-ui

```
make init
make build config=ci
```



## Developer build for working on external plugins

The setup for working on external plugins is very similar to that of working on kbase-ui, except that you must clone the plugins and instruct the image runner to mount the plugins.

The short list:

- create top level working directory
- within this directory clone kbase-ui and any plugins you want to work on
    - kbase-ui needs to start out in develop branch of kbase/kbase-ui
    - plugins only have a master branch
- build kbase-ui
- build the kbase-ui dev image
- configure your /etc/hosts to use the dev server
- run the image with the plugins linked in:


### Create Top Level Working Directory

The kbase-ui tools assume that kbase-ui is cloned alonside any plugins or libraries which are linked into it. Therefore, you need to create a single working directory and clone the repos inside of it.

Let's assume this is ~/work/dev, or just dev for short.

### Clone kbase-ui and any plugins

```bash
cd ~/work/dev
git clone -b develop https://github.com/kbase/kbase-ui
git clone https://github.com/kbase/kbase-ui-plugin-my-plugin
```

You'll need a PR friendly git clone setup. There are several ways to do this. Using the above as a starting point, for instance:

```bash
cd ~/work/dev/kbase-ui
git checkout -b <my-plugin-work>
git remote add <nickname> ssh://git@github.com/<account>/kbase-ui
cd ~/work/dev/kbase-ui-plugin-my-plugin
git checkout -b <my-plugin-work>
git remote add <nickname> ssh://git@github.com/<account>/kbase-ui-plugin-my-plugin
```

This will add your fork of kbase-ui under the remote name <nickname>. Note that it is using ssh transport, which will your ssh key registered at github. If you don't work with ssh keys, you would just use the normal https form:

```bash
git remote add <nickname> https://githiub.com/<account>/kbase-ui
```

Of course this assumes you have forked kbase-ui!

You would be working in the new local branch named <my-plugin-work>, which started at the tip of the develop branch. You would then push your changes up to your fork like

```bash
cd ~/work/dev
git push <my-plugin-work>
```

Working with the plugin is similar, except your branch starts at the tip of the master branch.

Of course, your workflow may be completely different, this is just an example.


---

[Index](index.md) - [README](../README.md) - [Release Notes](../release-notes/index.md) - [KBase](http://kbase.us)

---