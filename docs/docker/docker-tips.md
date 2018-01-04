# Docker Tips

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