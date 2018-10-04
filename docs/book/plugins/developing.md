# Developing kbase-ui Plugins

This guide describes a workflow for working on kbase-ui plugins, and deploying plugin and kbase-ui updates.

Because the creation of a plugin involves a set of one-time tasks, it is described in a separate document [Creating a New Plugin](developing-new-plugin.md).

[TOC]

## Prerequisites

This guide does not cover setting up kbase-ui for development -- if you have not done that yet please see the following documents:

* [Prerequisites](../getting-started/prerequisites.md)
* [Quick Start](../getting-started/quick-start.md)

## Setting Up

Good, now that you have set up a kbase-ui development environment, it is time to integrate a plugin to work on.

### Fork the Plugin Repo

If you haven't yet, now is the time to fork the plugin repo from github.

All kbase plugins have an upstream repo in the kbase github account at ```https://github.com/kbase/kbase-ui-plugin-THEPLUGIN```.

Where ```THEPLUGIN``` is the name of the plugin.

> Well, sometimes during initial development, a plugin may reside at your personal repo. This saves the extra pull request step which can slow down iterative development, especially when a plugin is being born. This only works well when you are the sole developer of the plugin.

Note that all plugin repos are prefixed with ```kbase-ui-plugin-```. This is not a hard requirement, in that kbase-ui can use plugins named otherwise. However kbase-ui build tools assume this naming convention, and it is good practice for a few reasons:

- it creates a uniqe name in the *github* namespace
- it creates a a unique name in the *bower* namespace (more on that later)
- it makes it easier to manage plugins in your project (they appear together in directory listings)

When we reference the *name* of a plugin, we always refer the the string occurring after the *kbase-ui-plugin-* prefix.

So, your task is to fork the repo you are interested in:

- create a github account if you do not already have one
- sign in to github if you are not already and ensure you are using the correct account for kbase work
- visit the github page for the plugin
    - the root page for all plugins is https://github.com/kbase
- fork the repo into your github account using the fork button


### Clone the Plugin Repo

We'll clone the plugin repo using the same method used for setting up kbase-ui for development.

First, open a terminal in the top level ```project``` directory you set up (in [Quick Start](../getting-started/quick-start.md)) to contain the kbase-ui repo.

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

> You probably don't have push access to the repo, but this is a good practice; it sets the "push" url for the origin repo to a nonsensical url, thus preventing accidental commits to the canonical repo. No-one, even repo owners, should ever commit directly to a canonical repo.

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

### Build and run the image with the plugin linked

A tool is provided to both run the kbase-ui image (container) and at the same time link the local plugin directly into the image. Once you have done this, changes made to the local plugin will be relfected immediately in kbase-ui (after a browser reload.)

This works by mounting the plugin source directory to the corresponding location inside of the kbase-ui container. The docker-mounted directory will temporarily replace the directory which was installed when kbase-ui was built.

```
cd ~/work/project/kbase-ui
make docker-service-start plugins="PLUGINNAME"
```

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

You may now make changes to the plugin, and see those changes reflected immediately upon refreshing the browser.

This is the essential plugin workflow

#### What is happening...

##### ...with mounting the plugin inside the container

The *plugins* option to *make docker-service-start* provides just enough information for the tool to be able to find the plugin directory and map the source directory into the kbase-ui container.

Let me explain:

Remember, if we have set up the project directory in the pattern described above, the plugin directory indicated by PLUGINNAME is located one directory above kbase-ui, and named "kbase-ui-plugin-PLUGINNAME".

Inside the plugin the directory structure is uniform. The directory path `kbase-ui-plugin-PLUGINNAME/src/plugin` is the root of the plugin source code. When kbase-ui is built, this directory is copied directly to `kbase-ui/build/build/client/modules/plugins/PLUGINNAME`. When the kbase-ui image is built, the build code is copied to `/kb/deployment/services/kbase-ui`, and now the plugin code lives at `/kb/deployment/services/kbase-ui/modules/plugins/PLUGINNAME`

>  See [About Building](../development/building.md) for an explanation of the build process and structure.

The important point is that the *plugins* option will tell Docker to mount your plugin repo src/plugin directory into the kbase-ui image at the location described above.

Once this mapping has been done, any changes you make to the plugin are "live" inside the kbase-ui docker container. A simple refresh of the browser will load any changes.

## Next Topics

The next few sections will cover the following topics:

- Testing
- Releasing
- Merging into kbase-ui "for reals"
- Deploying into CI
- Additional Topics
  - Debugging Tips
  - supported kbase-ui dependencies
  - What? You need a new dependency?


## Testing

We don't currently have a formal test harness for automated testing of plugins, so all of your testing will be by hand. Nevertheless, you do have the ability to manually verify that your plugin works against all kbase environments.

> Maybe we should rather call this "verification"

There are three basic levels of testing, each more onerous than the previous.

- Dev mode testing - use the kbase-ui dev build, with local plugin changes mounted into the image
- Dev build testing - use the kbase-ui dev build with local plugin changes checked in and released
- Prod build testing - use the kbase-ui prod build with local plugin changes released

### Manual Testing Process

For each environment (dev, ci, next, appdev, prod), do the following:

- start the kbase-ui container for that environment

  - ```bash
    make run-image env=ENV
    ```

  - where ENV is each of dev, ci, next, appdev, prod

- start the proxier for the matching environment

  - ```bash
    make run-proxier-image env=ENV
    ```

  - note that this ENV must match the first one

- Perform your tests

These steps are identical for each of the testing modes

### Dev Mode Testing

This is essentially an extension of the normal edit & reload process, with the twist that you should check all top features of the plugin for regression, and check against all deployment environments. 

You should perform this testing before releasing your plugin changes.

### Dev Build Testing

In this test mode, you have check in, merged, and released the plugin changes (because they passed the Dev Mode Testing above). You will have updated kbase-ui with the new plugin version, and rebuilt kbase-ui (as described in Preparing for Release.)

- push your code up to your repo
- issue a PR for the plugin
- either merge the PR yourself, or request a review and merge
- create a semver tag for the kbase plugin repo
- update the kbase-ui build files with the new semver:
  - config/app/dev/plugins.yml
  - config/app/prod/plugins.yml

You should perform this testing before a kbase-ui Pull Request which integrates your updated plugin.

If you feel confident in your changes, or they are trivial, you may skip this step and continue to Prod BuildTesting.

### Prod Build Testing

Finally, before issuing a PR for integrating your updated plugin into kbase-ui, you need to perform testing using the production build. This should be done sparingly, and usually just as a pre-release task, because the prod build can take several minutes. Fortunately, once the build is finished the same as above.

In addition to the tasks for Dev Build Testing:

- make the prod build 
- make the image using the prod build

Then perform your tests against each environment as described above.

### Future Testing Plans

First, there is nascent support for selenium-based integration testing in kbase-ui. Thus you can perform ad-hoc automated integration testing if you set up the tests by hand. We do not have this testing integrated into Travis or Jenkins, nor a method for integration of plugin tests into the kbase-ui testing apparatus.

See [Testing](testing.md) for more.

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

> If the PR is in the early stages, it may still be in your personal github account; if this is so clearly you can skip the PR process for the plugin, and issue the new release version yourself. Don't worry —  when you transfer the repo to the kbase account, all commits and release tags are retained.

## Next Steps

- [Creating a New Plugin](creating-a-new-plugin.md)

---

[Index](../index.md) - [README](../README.md) - [Release Notes](../../release-notes/index.md) - [KBase](http://kbase.us)

---


