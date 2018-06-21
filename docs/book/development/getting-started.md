# Getting Started

This doc describes how to get set up for kbase-ui development.

[TOC]

## Prerequisites

- [Prerequisites](prerequisites.md)

## Basic usage

The first step for any kbase-ui effort is to set up a project directory, prepare a copy of kbase-ui, and ensure that it works.

### Create a working directory for your project

In this and all developer documentation, it is assumed that all repos are installed under a single root working directory. Developer tools support this simple directory layout.

We'll just call this directory *~/work/project*, but you can of course place it wherever you like and name it whatever pleases you.

```bash
mkdir -p ~/work/project
cd ~/work/project
```

### Install a local copy of kbase-ui

All development workflows for kbase-ui involve starting from the tip of the develop branch of the kbase-ui repo in kbase github account. You will therefore be pushing changes to your fork of kbase/kbase-ui.

If you have your own preferred method of setting up a repo for this type of workflow, please use it. Here is one setup that I use:


```bash
git clone -b develop https://github.com/kbase/kbase-ui
cd kbase-ui
git remote set-url --push origin no-push
git remote add NICKNAME ssh://git@github.com/YOURACCOUNT/kbase-ui
git checkout -b BRANCHNAME
git push NICKNAME BRANCHNAME
```

With this flow, you are operating in the branch *BRANCHNAME*, which started at the tip of the *develop* branch in the main *kbase/kbase-ui* repo. You will push it to your fork located at the github account *YOURACCOUNT*, which has been set up at remote *NICKNAME* in the local git configuration.

> Note: this setup requires that you have generated an ssh key on your machine, and installed it in your giithub account.

#### Install custom Docker network

In order for the proxier to access the kbase-ui container, or for more advanced workflows involving locally hosted services or service mocks, we need to establish a local custom network for Docker. It can be named anything you like, as long as it is consistent across images. We choose the name ```kbase-dev```.

```bash
docker network create kbase-dev
```

#### Build and run kbase-ui

This will fetch, prepare, build, create the image, and run a container from that image. 

```bash
make init
make build config=dev
make image build=build
make run-image env=dev
```

Where:

- ```make init``` installs all of the build and testing tools and libraries not already covered by the prerequisites
- ```make build config=dev``` runs the developer build of kbase-ui (defaults to prod build)
- ```make image build=build``` builds a Docker image containing the dev build of the ui (defaults to the prod "dist" build)
- `make run-image env=dev` runs the Docker image with the dev environment (defaults to the "prod" environment)

> Tip: 
>
> On macOS and Linux/Unix you may want to use the ```aliaas``` shell command to create your own shortcuts. E.g. 
>
>```bash
>alias buildui="make build config=dev;make image build=build"
>```
>
> will make the shell command ```buildui``` available in your shell. See tools/devtools.sh

#### Prepare and run the Proxier

The proxier is a small Docker image which runs nginx to proxy requests for a given KBase deployment hostname (e.g. ci.kbase.us) to a local kbase-ui Docker container, with other requests routed to the canonical locations within KBase. 

```bash
make proxier-image
make run-proxier-image env=dev
```

Where

- `make proxier-image` builds the proxier Docker image
- `make run-proxier-image env=dev` will start a container running this image, using the `dev` environment. The `dev` env is the default, so you may omit this.

> Note: A shortcut for `make run-proxies-image env=dev`, runui, is provided in tools/devtools.sh

The *dev* env responses to ci.kbase.us.

#### Map ci.kbase.us to your local host

In order for your browser to use the proxier for requests to ci.kbase.us, you need to add a line to your `/etc/hosts` (or equivalent, if on Windows). 

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

#### Bring up the local kbase-ui

Bring up your browser to [https://ci.kbase.us](https://ci.kbase.us).

You'll receive a security warning due to the usage of a self-signed ssl certificate inside the container. Just go through the hoops to accept it. Each browser is different.

> Tip: Browsers can be VERY finicky with self signed certs, especially if you have change the self signed cert, which may happen when you rebuild the proxier image.

#### Stop it

When you are finished you will want to stop the container, simpley press `Ctrl`+ `C`. The container should immediately stop. 

You may also use your favorite docker management tool, such as Kitematic on macOS.

## More

[Docker Tips](docker-tips.md) - a collection of handy docker commands

## Next Steps

- [Developing a Plugin](developing-a-plugin.md)
- [Creating a External Plugin](creating-a-new-plugin.md)


---

[Index](../index.md) - [README](../README.md) - [Release Notes](../../release-notes/index.md) - [KBase](http://kbase.us)

---