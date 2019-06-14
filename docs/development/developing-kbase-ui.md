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


---

[Index](../index.md) - [README](../README.md) - [Release Notes](../../release-notes/index.md) - [KBase](http://kbase.us)

---