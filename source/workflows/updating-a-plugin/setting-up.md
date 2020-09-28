# Updating a Plugin

This guide describes a workflow for working on an existing kbase-ui plugin.

## Prerequisites

This guide does not cover setting up kbase-ui for development -- if you have not done that yet please see the following documents:

* [Prerequisites](/getting-started/prerequisites)
* [Quick Start](/getting-started/quick-start.md)

## Setting Up

Good, now that you have set up a kbase-ui development environment, it is time to integrate a plugin to work on.

### Fork the Plugin Repo

If you haven't yet, now is the time to fork the plugin repo from github.

All kbase plugins have an upstream repo in the kbase github account at ```https://github.com/kbase/kbase-ui-plugin-THEPLUGIN```.

Where ```THEPLUGIN``` is the name of the plugin.

> Well, sometimes during initial development, a plugin may reside at your personal repo. This saves the extra pull request step which can slow down iterative development, especially when a plugin is being born. This only works well when you are the sole developer of the plugin.

Note that all plugin repos are prefixed with ```kbase-ui-plugin-```. This is not a hard requirement, in that kbase-ui can use plugins named otherwise. However kbase-ui build tools assume this naming convention, and it is good practice for a few reasons:

- it creates a unique name in the *github* namespace
- it makes it easier to manage plugins in your project (they appear together in directory listings)
- it makes tooling easier because you can refer to the plugin name THEPLUGIN rather than the entire repo name.

When we reference the *name* of a plugin, we always refer the the string occurring after the *kbase-ui-plugin-* prefix.

So, your task is to fork the repo you are interested in:

- create a github account if you do not already have one
- sign in to github if you are not already and ensure you are using the correct account for kbase work
- visit the github page for the plugin
    - the root page for all plugins is https://github.com/kbase
- fork the repo into your github account using the fork button


### Clone the Plugin Repo

We'll clone the plugin repo using the same method used for setting up kbase-ui for development.

First, open a terminal in the top level `project` directory you set up (in [Quick Start](/getting-started/quick-start.md)) to contain the kbase-ui repo.

Then we'll clone the canonical plugin repo in the kbase account.

```bash
$ cd ~/work/project
$ git clone https://github.com/kbase/kbase-ui-plugin-PLUGINNAME
```

Then ensure that you can't accidentally merge changes back into the kbase repo:

```bash
$ cd kbase-ui-plugin-PLUGINNAME
$ git remote set-url --push origin nopush
```

> You may not have push access to the repo, but this is a good practice; it sets the "push" url for the origin repo to a nonsensical url, thus preventing accidental commits to the canonical repo. No-one, even repo owners, should ever commit directly to a canonical repo.

Then add a remote which is your fork of the repo.

```bash
$ git remote add NICKNAME https://github.com/YOURACCOUNT/kbase-ui-plugin-PLUGINNAME
```

This sets up a remote named *NICKNAME* (which can be anything you like) which points to your fork at github account *YOURACCOUNT* using the https method.

### Using ssh to save keystrokes

If you want to avoid the need to enter your password every time you push changes back up to your account, you may want to set up an ssh key:

[https://help.github.com/articles/connecting-to-github-with-ssh]().

If you have an ssh key for your current machine established for your github account, the clone command would look like

```
$ git remote add NICKNAME ssh://git@github.com/YOURACCOUNT/kbase-ui-plugin-PLUGINNAME
```

 In either event, you have now established the plugin as a sister directory to kbase-ui. Your development directory should now look like:

 ```
 project
    kbase-ui
    kbase-ui-plugin-PLUGINNAME
 ```


### Caveat: You can do it your own way

If you are experienced with git workflows, and you feel you have a better way of managing or naming remotes, please feel free.

The only hard requirement is that the plugin repo be a sister directory to kbase-ui.

### Build and run the image with the plugin linked

A tool is provided to both run the kbase-ui image (container) and at the same time link the local plugin directly into the image. Once you have done this, changes made to the local plugin will be reflected immediately in kbase-ui (after a browser reload.)

This works by mounting the plugin source directory to the corresponding location inside of the kbase-ui container. The docker-mounted directory will temporarily replace the directory which was installed when kbase-ui was built.

```bash
cd ~/work/project/kbase-ui
make dev-start plugins="PLUGINNAME"
```

The `plugins` option accepts a space delimited string of plugin names. You can omit the quotes, but I usually use them in case I need to map an additional plugin.

You should see a successful startup of the docker container, with several log lines printed into the console, similar to this:

```
Tests-MBP:kbase-ui erikpearson$ make docker-service-start
bash tools/docker/create-docker-network.sh kbase-dev
> Building and running docker image for development
Creating kbase-ui ... done
Creating kbase-ui-proxy ... done
Attaching to kbase-ui, kbase-ui-proxy
kbase-ui          | Checking config file...
kbase-ui          | OK. Execing nginx... Press Control-C to exit.
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: using the "epoll" event method
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: nginx/1.12.2
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: OS: Linux 4.9.87-linuxkit-aufs
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: getrlimit(RLIMIT_NOFILE): 1048576:1048576
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: start worker processes
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: start worker process 16
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: start worker process 17
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: start worker process 18
kbase-ui          | 2018/07/13 21:26:41 [notice] 12#12: start worker process 19
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: using the "epoll" event method
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: nginx/1.12.2
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: OS: Linux 4.9.87-linuxkit-aufs
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: getrlimit(RLIMIT_NOFILE): 1048576:1048576
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: start worker processes
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: start worker process 16
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: start worker process 17
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: start worker process 18
kbase-ui-proxy    | 2018/07/13 21:26:41 [notice] 11#11: start worker process 19
```

## Develop!

There are two basic plugin workflows from here:

- build / build-dev / watch for legacy Javascript plugins
- CRA standalone for newer CRA-Typescript plugins

### build / build-dev /watch

Legacy loose-javascript plugins use a simple build process. The build process is triggered by issuing

```bash
yarn build
```

at the top level of the repo, and is responsible for:

- fetching dependencies
- placing them into the `src/plugin/iframe_root/modules/vendor` directory
- copying all source in to the `/dist/plugin` directory
- minifying
- creating a gzipped tar file for distribution.

The local development integration with kbase-ui maps the `dist/plugin` directory into the corresponding location in the kbase-ui container.

To support rapid iteration, a sister make task `build-dev` will just copy the source into `/dist/plugin`. It does not fetch dependencies, minifiy, or build the dist archive, so it is fast (should take around a second.)

Most plugins have a `build-dev` task, but I've only added it on an as-need basis.

A convenience present in only a few plugins (e.g. `dataview`), is a `watch` task, which uses `nodemon` to watch for filesystem changes, and will launch `make build-dev` when such changes occur.

### CRA Standalone

[ TODO ]

## What is happening...

### ...with mounting the plugin inside the container

The *plugins* option to *make docker-service-start* provides just enough information for the tool to be able to find the plugin directory and map the source directory into the kbase-ui container.

Let me explain:

Remember, if we have set up the project directory in the pattern described above, the plugin directory indicated by PLUGINNAME is located one directory above kbase-ui, and named "kbase-ui-plugin-PLUGINNAME".

Inside the plugin the directory structure is uniform. The directory path `kbase-ui-plugin-PLUGINNAME/src/plugin` is the root of the plugin source code. When kbase-ui is built, this directory is copied directly to `kbase-ui/build/build/client/modules/plugins/PLUGINNAME`. When the kbase-ui image is built, the build code is copied to `/kb/deployment/services/kbase-ui`, and now the plugin code lives at `/kb/deployment/services/kbase-ui/modules/plugins/PLUGINNAME`

>  See [About Building](../development/building.md) for an explanation of the build process and structure.

The important point is that the *plugins* option will tell Docker to mount your plugin repo src/plugin directory into the kbase-ui image at the location described above.

Once this mapping has been done, any changes you make to the plugin are "live" inside the kbase-ui docker container. A simple refresh of the browser will load any changes.
