# Deployment Tools and Resources

This directory contains tools and resources for a docker based deploy of kbase-ui in any of our environments (ci, next, appdev, prod) as well as local development.

The deployment process is described in /docs, but briefly:

An image is built which will contain the kbase-ui build, an nginx server, and necessary boilerplate for configuration during docker run. When the image is run the entrypoint script will have been provided with enough information to create a configuration file for the desired runtime environment. It will proceed to create the config file and then launch the nginx server.

## Building image

Use the top level Makefile for building images. There is a make task for the three different images: local dev, ci, and production.

- make dev-image
- make ci-image
- make prod-image

Prior to building an image, kbase-ui itself must be built.

### Local Development

```bash
make init
make build
make dev-image
```

### CI

```bash
make init
make build config=ci
make ci-image
```

### Production

```bash
make init
make build config=prod
make prod-image
```

### Tag the repo for a prod build

The production build expects to be on a tag. The ui will not build without this.

### By hand

Within each deployment environment directory, deployment/dev, etc., the tools directory contains scripts for building the image and running containers (for dev).

```bash
bash tools/build_docker_image.sh
```
