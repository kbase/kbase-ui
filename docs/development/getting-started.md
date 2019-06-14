# Getting Started

This document describes how to get set up for kbase-ui development.

## Prerequisites

-   [Prerequisites](../getting-started/prerequisites.md)
-   [Quick Start](../getting-started/quick-start.md)

## Introduction

If you have followed the [Prerequisites](../getting-started/prerequisites.md) and [Quick Start](../getting-started/quick-start.md) documents, you will have all the setup you need to get started.

To support development of kbase-ui itself, plugins, libraries, and local or dynamic services, several tools and techniques are available. The gist of these is:

-   proxying all requests to the ui, which allows kbase-ui to work seamlessly as if it were installed in any given kbase deployment environment;
-   mounting local directories into the kbase-ui container, allowing kbase-ui served inside the container to utilize files being edited locally

## Workflow

A typical work flow involves:

1. create working folder
2. checkout and setup repos you'll be working on
3. map ci.kbase.us host
4. start up kbase-ui
5. stop kbase-ui
6. unmap ci.kbase.us host

### 1. Create Working Folder

In this and all developer documentation, it is assumed that all repos are installed under a single root working directory. Developer tools support this simple directory layout.

We'll just call this directory _~/work/project_, but you can of course place it wherever you like and name it whatever pleases you.

```bash
mkdir -p ~/work/project
cd ~/work/project
```

### 2. Checkout and Setup Repos

Within the project directory created above, you will need to clone kbase-ui as well as any other plugin or library repo you will be working on.

The directory structure will resemble:

```
project
  kbase-ui
  kbase-ui-plugin-MYPLUGIN
  kbase-MYLIBRARY
```

#### Install a local copy of kbase-ui

Development workflows for kbase-ui typically start from the tip of the develop branch of the kbase-ui repo in the kbase github account. You will therefore be pushing changes to your fork of kbase/kbase-ui.

If you have your own preferred method of setting up a repo for this type of workflow, please use it. Here is one setup that I use:

```bash
git clone -b develop https://github.com/kbase/kbase-ui
cd kbase-ui
git remote set-url --push origin nopush
git remote add NICKNAME ssh://git@github.com/YOURACCOUNT/kbase-ui
git checkout -b BRANCHNAME
git push NICKNAME BRANCHNAME
```

With this flow, you are operating in the branch _BRANCHNAME_, which started at the tip of the _develop_ branch in the main _kbase/kbase-ui_ repo. You will push it to your fork located at the github account _YOURACCOUNT_, which has been set up at remote _NICKNAME_ in the local git configuration.

> Note: this setup requires that you have generated an ssh key on your machine, and installed it in your giithub account. If you prefer to work over https and use your github username and password that line above would be `git remote add NICKNAME https://github.com/YOURACCOUNT/kbase-ui

> To be honest, I often skip the local BRANCHNAME and just operate directly on the develop branch.

#### Install local copies of each other repo

In the same working directory clone each plugin or library you will be working on, using your preferred method.

### 3. Map ci.kbase.us to your local host

In order for your browser to use the kbase-ui proxy for requests to ci.kbase.us, you need to add a line to your `/etc/hosts` (or equivalent, if on Windows).

```hosts
127.0.0.1  ci.kbase.us
```

In fact, you may find it handy to add this entire section to your /etc/hosts, and comment in the environment you are currently working on:

```
127.0.0.1	ci.kbase.us
#127.0.0.1	appdev.kbase.us
#127.0.0.1	next.kbase.us
#127.0.0.1	kbase.us narrative.kbase.us
```

### 4. Start kbase-ui

The local development workflow hinges on using Docker Compose to build and start both kbase-ui and the kbase-ui local proxy containers. Docker Compose simplifies configuration, as it is completely contained within `dev/docker-compose.yml` and `dev/docker-compose.override.yml`, and uses a simple set of docker-compose commands for all operations.

If you are familiar with the previous incarnation of kbase-ui workflow, which relied upon direct usage of `docker`, this new workflow is simpler and more reliable.

> However, it is new, so some workflows are not captured yet by the tools

The general form of the dev-start tool is:

```
make dev-start \
    [build=BUILD] \
    [env=ENV] \
    [plugins="P1 P2"] \
    [internal-plugins="I2 I2"] \
    [libraries="L1 L2"] \
    [paths="T1 T2"] \
    [build-image="t/f"] \
    [local-narrative="t/f"] \
    [dynamic-services="D1 D2"]
```

The most dead simple version is:

```
make dev-start
```

which simply starts up kbase-ui against CI, using the development build.

In order to incorporate a plugin cloned in the project directory, us this form

```
make dev-start plugins="MYPLUGIN"
```

The first time you run `dev-start` the kbase-ui and kbase-ui-proxy images are built. Thereafter those images are used when you stop and start kbase-ui. If you have made changes to kbase-ui which you want incorporated directly into the image, you will need to regenerate the image. You do that with the `build-image` option.

```
make dev-start build-image=t
```

For details on usage, see [Developer Tools](tools.md).

### 5. Stop kbase-ui

When you are finished with a work session, or for whatever reason wish to stop the kbase-ui and proxy containers:

-   Press `Control` + `C` in the window in which the docker-compose-up tool was run.
    This should exit the tool, and hopefully stop the containers.
-   run `make dev-stop`
    We do this to stop and remove any started containers, as well as to remove the custom kbase-dev network created by `make dev-start`

## 6. unmap ci.kbase.us

This is optional, but unless you are continuing to work on local kbase-ui, you should remove the /etc/hosts mapping in order to gain access to the "real" ci.kbase.us.

I prefer to simply comment out the line so it is ready for reuse later.

## Next Steps

-   [⛏ Working with Plugins](../plugins/README.md)
