# Building KBase UI

These are the latest build instructions for KBase UI.

12/11/2015

- ensure you have the prequisites
- fetch kbase ui

## Prerequisites

If your machine is not set up for javascript development, you may need to install some prerequisites. If so, please refer to the [developer set up docs].

- install system tools and global node binaries
- the kbase-ui Makefile does not install anything globally

# Create a development environment

This directory will contain the kbase-ui repo and any other related repos or files. The kbase-ui is self-contained, but if you will be working on plugins in tandem, it is handy to use a working directory to contain each repo -- kbase-ui and any plugins.

```
dev
  kbase-ui
  kbase-ui-plugin-myplugin
```

## Create develoment directory

For now, just create the ```dev``` (or whatever you want to call it) wherever you want to. We'll refer to that as the *dev* directory.

## Grab a copy of kbase-ui and make sure it is working

Within the *dev* directory

```
git clone https://github.com/kbase-ui
```

> Note: At the moment of this writing, we are actively developing the master branch. Soon we will move on to the standard KBase branch layout, and this information will be obsolete.

The basic workflow uses *make* to control the essential build, test, and deploy processes. However, the actual commands are more flexible, and implemented in javascript through Node. So as we walk through these processes, we'll first present the top-level *make* procedure, and then the actual tasks accomplished, and finally the more detailed low level javascript commands.

### Build the Kbase UI

So, first we will build the developer version of *kbase-ui*:

```
cd kbase-ui
make build
```

#### What does it do?

- installs npm packages (npm install)
- sets up the developer environment if it doesn't yet exist (dev)
- uses the developer preferences to configure the ui
- installs bower packages
- arranges all files into a build directory
- installs the build directory into the dev directory

The tasks will clean out, build, start a web server, and launch your default browser against a freshly constructed "build" version of kbase.ui. The build version will utilize un-minified javascript and css, and may generally be looser in the application of code quality checks.

### Start the Dev Server

Included with kbase-ui is a very small, static nodejs server. We use this server for previewing and demoing kbase-ui.

```
make start
```

This starts the node web server in ```dev/server``` on port 8080

> Coming soon, options for starting the server on a different port, and tareting dist or build.

- ensures that the required node modules are installed locally
- starts up a web server on port 8080
- sets the server root to either dev (kbase-ui/dev/build) or release (kbase-ui/dist)

### Preview the Site

After the server is started, it can be accessed at *http://localhost:8080* on any local browser. However, while your fingers are on the keyboard and you are focused on the terminal...

```
make preview
```

#### What does it do?

- opens default browser on your system with a url for the test server

## A better workflow

Ordinarily you would not want to leave the server running in your main development window, yet you will want to have it running for a long time.

In a separate terminal (e.g. hit *Command+T* on a Mac) navigate to the kbase-ui dev directory (yes, this dev directory is internal to kbase-ui...) and start a local web server

```
cd kbase-ui/dev
node server
```

This workflow allows you to rebuild kbase-ui, yet keep the local server running in order to refresh the browser to pick up the changes.

Yes, I know this is now considered an archaic development workflow.


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


