# Docker Tips

### Use Kitematic

On macOS, Docker includes a menu item for starting Kitematic. Kitematic is a gui for managing images and containers. It will simplify your life. It is especially useful for running a shell in an running container, accessing the configuration for a container, and finding images to install.

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

---

[Index](../index.md) - [README](../README.md) - [Release Notes](../../release-notes/index.md) - [KBase](http://kbase.us)

---