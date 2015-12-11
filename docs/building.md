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

At the moment of this writing, we are actively developing the master branch. By the time you read this, we will probably have moved on to the standard kbase branch layout, and this information will be obsolete.

```
cd kbase-ui
npm install
grunt clean-build --target test
grunt build-build --target test
grunt preview-build --target test
```

If all went well, you should see the kbase ui pop up in your default browser.

The grunt tasks will clean out, build, start a web server, and launch your default browser against a freshly constructed "build" version of kbase.ui. The build version will utilize un-minified javascript and css, and may generally be looser in the application of code quality checks.