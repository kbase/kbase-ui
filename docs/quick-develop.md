# Quick Develop Guide

This document describes how to set up an kbase-ui development environment. 


## Prerequisites

See the [Prerequisites Guide](prerequisites.md).

## Related 

- Architecture (to be done)
- Configuration (to be done)
- Filesystem (to be done)

# Create a development environment

This directory will contain the kbase-ui repo and any other related repos or files. The kbase-ui is self-contained, but if you will be working on plugins in tandem, it is handy to use a working directory to contain each repo -- kbase-ui and any plugins. In addition, during development it is handy to point the temporary build directory outside of the repo. Some IDEs will thrash if build artifacts are created within the repo.

For example:

```
dev
  kbase-ui
  kbase-ui-plugin-my-plugin
  kbase-ui-plugin-my-other-plugin
```

## Grab a copy of kbase-ui and make sure it is working

Within the *dev* directory

```
git clone -b develop https://github.com/kbase-ui
```

The basic workflow uses *make* to control the essential build, test, and deploy processes. However, the actual commands are more flexible, and implemented in javascript through Node. So as we walk through these processes, we'll first present the top-level *make* procedure, and then the actual tasks accomplished, and finally the more detailed low level javascript commands.

### Build the Kbase UI

So, first we will build the developer version of *kbase-ui*:

```
cd kbase-ui
make init
make dev
make build
```

#### What does it do?

- ```make init```
    - installs npm packages (npm install) required by the build and other tools
- ```make dev```
    - sets up the developer environment if it doesn't yet exist (dev)
    - copies the build config into the developer environment
- ```make build```
    - defaults to the developer build configuration
    - installs bower packages
    - arranges all files into a build directory
    - installs the build directory in to the canonical build location ```/build/build```

The build version will utilize un-minified javascript and css, and may generally be looser in the application of code quality checks.

### Start the Dev Server

Included with kbase-ui is a very small, static nodejs server. We use this server for previewing and demoing kbase-ui.

```
make start
```

This starts the node web server, pointing to the default developer build location *build/build/client* on port 8080.

#### What does it do?

- launches server located in *tools/server*
- uses the port configured in the build config, which defaults to *dev*
- uses the directory target *build/build/client*, which is the default.

#### Additional configuration options

- For port, edit the *dev/config/ui/builds/dev.cfg* yaml file.
- for directory target, supply the make argument "directory=XXX", where XXX is build, dist, or deployed. For build or dist, the directory selected is *build/XXX/client* and for deployed it is always */kb/deployment/services/kbase-ui* 

> Note: we will be providing configurability of the deployment location

### Preview the Site

After the server is started, it can be accessed at *http://localhost:8080* on any local browser. However, while your fingers are on the keyboard and you are focused on the terminal...

```
make preview
```

This defaults to the developer configuration to determine the port to use in the url.

#### What does it do?

- opens default browser on your system with a url for the test server

#### Additional configuration options

- make argument config=XXX will use the port indicated in that build config, which defaults to dev.

## Basic Workflow

Once you have the server started, web browser pointed to it, and your favorite editor or IDE pointed to the kbase-ui repo, the essential workflow is:

- edit
- build
- preview

This has the advantage that whatever code you have modified will run through the build process, which may have certain checks in place to assist in code quality, etc.

However, if you have a highly iterative work style, or need to hammer on a specific project for an extended period of time, this workflow can become tedious, since the build still may take several seconds.

## A better workflow

A better workflow is to link your source code directly into the build. This has the advantage of code changes becoming immediately available upon a browser refresh. You can even use this method for editing plugins from a separate repo.

We do not currently have tools to support this, but will very soon. For now, you can do this yourself by removing the build source tree node you wish to work on, and linking the source node to that same location.

E.g.

```
rm -rf build/build/client/modules/plugin/welcome
ln -s src/client/modules/plugin/welcome build/build/client/modules/plugin/welcome
```

Of course, when you do eventually rebuild this linkage will be problem and you'll need to repeat the setup.


## Controlling the Build

There are three basic parameters for the build process, each of which control major characteritics of kbase-ui:

- *build* type, either build or dist, determines the final shape of the files. All else being equal, the actual UI will function the same with any build, although there may be other noticable differences, such as performance or debugability
    - *build* - the developer build, or just plain "build", is a fully functioning kbase-ui with all javascript files in standard form (not minified). This version is best for running in development, since browsers will have unfeterred access to legible source code. It is also good for testing, for the same reason, that test diagnosis will be much easier with full source access. In additionk, it is the right build in which to do code quality and correctness checks.
    - *dist* - the distribution, or "dist" build, is the form meant for final release. All code is minified and perhaps combined (concatenated) into compound files. These modifications are designed purely for performance reasons -- they offer no other improvements in usability of kbase-ui.
- *ui* target allows different configurations of the UI, including menus and plugins. The primary purpose is to provide a way to create ui configurations for testing new components, configuring the local kbase-ui for development, debugging, or testing, and yet to maintain an "official" set of configurations to match the different deployment environments. To that end, the following ui targets are supported:
    - ci
    - prod
    - dev
    - any locally defined targets (more on this later)
- the *deploy* target represents the interface between kbase-ui and other KBase services. As such, it defines 

There are currently three basic builds for kbase-ui: 
- *build* for *ci*, 
- *build* for *production*, 
- distribution for production.

There are two types of builds that can be produced. The standard build, or "build", is a complete kbase-ui in unminified form. All javascript and css should be in its original form. This aids in development -- debugging and build speed.

The distribution build, or "dist", is the standard build but with minification, concatenation, and possibly other manipulations applied to the original build files. A distribution represents, and at some point embodies, a kbase-ui release.

On the other hand, the build target represents the kbase host environment: service endpoint and configuration, user interface configuration.

The build type is expressed through the grunt task name. The following Grunt tasks are defined:

- clean-build
- build-build
- preview-build
- clean-dist
- build-dist
- preview-dist

At some point we will attempt to reduce the grunt tasks to clean, build, preview and supply the build type as a command line or configuration property.

The target is expressed through a command line or configuration property. The target must be supplied by one of the two methods, and the command line will override configuration.

The option ```--target <target>``` may be supplied to any of the grunt tasks listed above, although it only has effect on build-build and build-dist. The top level file *grunt-args.yml* provides configuration properties which are the equivalent of the command line properties. They default to development settings, which is typically desirable for most builds. 

The final product can easily be build with

```grunt build-dist --target prod```


## Development Support

This section to be fleshed out Real Soon Now :)

### Integrate Local Plugin Directory

Plugins are usually loaded from the local kbase-ui source tree, or from repos installed via Bower as indicated in the target plugins.yml config file. This is great for building and working on kbase-ui, but slow for working on external plugins. 

The external plugin workflow would basically be:

- clone plugin repo
- for plugin:
  - edit code
  - commit
  - push to origin
- for kbase-ui:
    - bower update
    - grunt build-build
    - refresh browser

With good tool support the number of steps could be reduced. Still, it could be better.

The build process supports supplying a directory rather than a repo for an external plugin. This allows the build process to pick up the development plugin directly.

Until this is documented, you can find an example of that configuration, commented out, in /targets/dev/plugin.yml.

### Your Own Target

The targeting mechanism is designed to be extensible, so that you can set up your own development targets. However, we do want to avoid having these checked into the codebase, so we need to do more work on this first. The idea is to have a sibling directory in which development assets are set up. The build process would look there as well as in kbase-ui. This would avoid having development artifacts accidentally checked into kbase-ui, and also protect developer assets from reinstallation of kbase-ui.

### IDE Integration

The clean/build/preview process can probably be integrated into your IDE or Editor of choice. We should document this. I currently use Netbeans, which has grunt integration for build and testing tasks.


