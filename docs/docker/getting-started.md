# Getting Started

This doc describes how to get set up for kbase-ui development.

## Basic usage

This section describes steps to get the ui running locally, but without any developer hooks. This is good to test that everything is in place.

(1) ensure you have prerequisites (esp. nodejs, git) installed, see [Prerequisites for Development](prerequisites.md).

(2) Build and run it

This will fetch, prepare, build, create the image, and run a container from that image.

```bash
git clone -b develop https://github.com/kbase/kbase-ui
cd kbase-ui
make init; make build; make dev-image; make run-dev-image
```

(4) Point your localhost to the container's nginx

Add to your host's /etc/hosts the following line:

```
127.0.0.1 ci.kbase.us
```

> Note: This is on your _host_ machine, not in the container.

> Note:  This disables access to the publicly available ci.kbase.us, so you'll need to comment it out when you want to get back to the real ci.

The docker container maps ports 80 and 443 to your host interface. If you have something else running on those ports you'll need to stop them first.

> Note: We'll get a host-based setup working (where you can alias ci.kbase.us to a non-localhost address).

(5) Bring up your browser to ci.kbase.us

You'll receive a security warning due to the usage of a self-signed cert inside the container. Just go through the hoops to accept it. Each browser is different; some browsers require a restart if you rebuild the image (which may create a new self-signed cert.)

(6) Stop it

When you are finished you will want to stop the container. An handy way to do this is to open a new terminal window and enter:

```bash
docker stop $(docker ps -q)
```

which will stop all running containers.

You may of course use your favorite docker management tool, such as Kitematic.

## More

[Docker Tips](docker-tips.md)

## Next

- [internal plugins](developing-internal-plugins.md)
- [external plugins](developing-external-plugins.md)
    - [adding a new plugin](adding-new-external-plugin.md)
- kbase-ui
- external libraries