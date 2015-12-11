# Building KBase UI

These are the latest build instructions for KBase UI.

12/11/2015

- ensure you have the prequisites
- fetch kbase ui
- 

## Prerequisites

If your machine is not set up for javascript development, you may need to install some prerequisites. If so, please refer to the [developer set up docs].


## Create a development directory

This directory will contain the kbase-ui repo and any other related repos or files. The kbase-ui is self-contained, but if you will be working on plugins in tandem, it is handy to use a working directory to contain each repo -- kbase-ui and any plugins.

```
dev
  kbase-ui
  kbase-ui-plugin-myplugin
```

For now, just create the ```dev``` (or whatever you want to call it) wherever you want to.


## Grab a copy of kbase-ui and make sure it is working

Within the dev directory

```
git clone https://github.com/kbase-ui
```

At the moment of this writing, we are actively developing the master branch. Soon we will move on to the standard KBase branch layout, and this information will be obsolete.

```
cd kbase-ui
npm install
grunt clean-build
grunt build-build
grunt preview-build
```

If all went well, you should see the KBase ui pop up in your default browser.

The grunt tasks will clean out, build, start a web server, and launch your default browser against a freshly constructed "build" version of kbase.ui. The build version will utilize un-minified javascript and css, and may generally be looser in the application of code quality checks.

## Controlling the Build

There are currently three basic builds for kbase-ui: build for ci, build for production, distribution for production.

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


