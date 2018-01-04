# Getting Started

This doc describes how to get set up for kbase-ui development.

## Basic usage

This section describes steps to get the ui running locally, but without any special developer hooks. This is good to test that everything is in place.

(1) Ensure you have prerequisites (esp. nodejs, git) installed, see [Prerequisites](prerequisites.md).

(2) Create a working directory for your project

In this and all developer documentation, it is assumed that all repos are installed under a single root working directory. Developer tools support this simple directory layout.

We'll just call this directory *~/work/project*.

```bash
mkdir ~/work/project
cd ~/work/project
```

(3) Install a local copy of kbase-ui

All development workflows for kbase-ui involve pull requests to the master repository located in the kbase github account. You will therefore be pushing changes to your fork of kbase/kbase-ui.

If you have your own preferred method of setting up a repo for this type of workflow, please use it. Here is one setup that I use:


```bash
git clone -b develop https://github.com/kbase/kbase-ui
cd kbase-ui
git remote set-url --push origin no-pushing
git remote add NICKNAME ssh://git@github.com/YOURACCOUNT/kbase-ui
git checkout -b BRANCHNAME
git push NICKNAME BRANCHNAME
```

With this flow, you are operating in the branch *BRANCHNAME*, which started at the top if the *develop* branch in the main *kbase/kbase-ui* repo. You will push it to your fork located at the github account *YOURACCOUNT*, which has been set up at *NICKNAME* in the local git configuration.

(3) Build and run it

This will fetch, prepare, build, create the image, and run a container from that image. 

```bash
make init
make build
make dev-image
make run-dev-image
```

(4) Point your localhost to the container's nginx

Add to your host's */etc/hosts* the following line:

```
127.0.0.1 ci.kbase.us
```

> Note: This is on your _host_ machine, not in the container.

> Note:  This disables access to the publicly available ci.kbase.us, so you'll need to comment it out when you want to get back to the real ci.

The docker container maps ports 80 and 443 to your host interface. If you have something else running on those ports you'll need to stop them first.

> Note: We'll get a host-based setup working (where you can alias ci.kbase.us to a non-localhost address).

(5) Bring up your browser to [https://ci.kbase.us](https://ci.kbase.us)

You'll receive a security warning due to the usage of a self-signed cert inside the container. Just go through the hoops to accept it. Each browser is different; some browsers require a restart if you rebuild the image (which may create a new self-signed cert.)

(6) Stop it

When you are finished you will want to stop the container. An handy way to do this is to open a new terminal window and enter:

```bash
docker stop $(docker ps -q)
```

which will stop all running containers.

You may of course use your favorite docker management tool, such as Kitematic.

## More

[Docker Tips](docker-tips.md) - a collection of handy docker commands

## Next Steps

- [Creating a new External Plugin](developing-new-external-plugin.md)
- [Developing External Plugins](developing-external-plugins.md)



---

[Index](../index.md) - [README](../../README.md) - [KBase](http://kbase.us)

---