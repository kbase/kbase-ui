# Developer Workflow with Docker

This doc describes basic procedures for developing kbase-ui core and plugins using a docker image and container workflow.

Docs are currently being built... the existing vm-workflow docs will be deprecated and the docker docs mainlined. 

## Basic usage

This section describes steps to get the ui running locally, but without any developer hooks. This is good to test that everything is in place.

(1) ensure you have prerequisites (esp. nodejs, git) installed, see [Prerequisites for Development](development-prerequisites.md).

(2) ensure you have docker installed for your platform (not documented here yet -- [Docker](https://www.docker.com)).

(3) Build and run it

This will fetch, prepare, build, create the image, and run an container from that image.

```bash
git clone -b develop https://github.com/kbase/kbase-ui
cd kbase-ui
make init; make build; make dev-image; make run-dev-image
```

(4) Point your localhost to the containers nginx

Add to your host's /etc/hosts the following line:

```
127.0.0.1 ci.kbase.us
```

> Note: This is on your _host_ machine, not in the container.

> Note:  This disables access to the publicly available ci.kbase.us, so you'll need to comment it out when you want to get back to the real ci.

The docker container maps ports 80 and 443 to your host interface. If you have something else running on those ports you'll need to stop them first.

> Note: We'll get a host-based setup working (where you can alias ci.kbase.us to a non-localhost address).

(5) Bring up your browser to ci.kbase.us

You'll receive a security warning due to the usage of a self-signed cert inside the container. Just go through the hoops to accept it.

(6) Stop it

When you are finished you will want to stop the container. An handy way to do this is to open a new terminal window and enter:

```bash
docker stop $(docker ps -q)
```

which will stop all running containers.



## Developer build for working on kbase-ui

The developer build is very similar, except you should be using your fork of whichever repo you are modifying, and when running the container you have the opportunity to map source directories into the running container.

If you've done the basic build above,you will want to wipe out that kbase-ui directory (if you are going to be updating your fork).

(1) ensure you have prerequisites (esp. nodejs, git) installed, see [Prerequisites for Development](development-prerequisites.md).

(2) ensure you have docker installed for your platform (not documented here yet -- [Docker](https://www.docker.com)).

(3) Build it

Build the ui and image

```bash
git clone -b ssh://git@github.com/<you>/kbase-ui
cd kbase-ui
make init; make build; make dev-image
```

(4) Run and mount source directories

For example:

```bash
bash deployment/dev/tools/run-image.sh dev -i catalog
```

The "-i catalog" maps the host directory for the catalog internal plugin into the container.

You may repeat "-i <plugin>" option as many times as you need.

> More options (mirroring features in the deprecated link.sh) will be added to mount arbitrary kbase-ui directories as well as libraries. The external plugin workflow is described below.

(5) Point your localhost to the containers nginx

If you haven't done so yet, add to your hosts /etc/hosts the following line:

```
127.0.0.1 ci.kbase.us
```

(see comments from the Basic usage section if interested)

(6) Work!

You can now enter a worflow in which you edit files within one of the mounts defined in (4) above, refresh the browser, and observe your changes.

(6) Stop it

When you are finished you will want to stop the container. An handy way to do this is to open a new terminal window and enter:

```bash
docker stop $(docker ps -q)
```

which will stop all running containers.

## More sections to be written for core ui development

- testing changes for all environments
- pull request for changes


## Developer build for working on external plugins

The setup for working on external plugins is very similar to that of working on kbase-ui, except that you must clone the plugins and instruct the image runner to mount the pluings

[ to be done ]

## More sections to be written for external plugin development

- testing changes for all environments
- pr, merge, tagging plugin
- local testing again with new version
- pr, merge ui changes (just config)
- redeploy on CI

## Other handy dockerisms


### Stop running containers

```bash
docker stop $(docker ps -q)
```

> If you just have one running container, it just stops that one.

### Stop all containers

```bash
docker stop $(docker ps -aq)
```


### Delete all containers

```bash
docker rm $(docker ps -aq)
```

### Remove all images

docker rmi -f $(docker images -q)

### Shell in docker container

```bash
docker exec -i -t <containerid> /bin/bash
```

e.g.

```bash
docker exec -i -t $(docker ps -q) /bin/bash
```

### Run image with bash avoiding entrypoint

Sometimes if the container startup is broken you need to just have a shell inside the container to poke around:

```bash
docker run -it --entrypoint /bin/bash kbase/kbase-ui:dev
```