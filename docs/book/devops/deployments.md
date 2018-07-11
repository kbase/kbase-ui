# Building kbase-ui

Although kbase-ui is *just* a browser web app, it is always used in combination with a web server to deliver it to the browser. 

For more on the kbase-ui code building process, see a description of [code building](../development/app-building.md).

This guide describes the steps to build the kbase-ui deliverable for each common usage scenario, including:

- local development
- CI build and deployment
- Next build and deployment
- Production (appdev & prod) deployment

Overall, following steps are involved:

- prepare build variables
- launch docker-compose with said variables set
- the docker build:
    - runs the kbase-ui build script
    - copies the build web-app, configuration, and other assets into the target image
- kbase-ui image is now prepared for the current branch
- for ci and prod builds:
    - the image is copied to dockerhub
    - someone runs the kbase-ui Jenkins job to redeploy a container using the image
    - the kbase-ui proxy is configured to route requests to this container
- for dev builds:
    - the image is a dependency of a local proxy
    - the local proxy is build and launched
    - the developer may then access kbase-ui locally
    - additional developer tasks allow mapping internal, plugin, or library directories into the container for interactive development.

## CI

### build

The CI build is automated via Travis, triggered by a merge into the develop branch at https://github.com/kbase/kbase-ui.

As would be expected, this is controlled through ```.travis.yml```.

The build is conducted through the travis "install" task which runs the following:

```bash
bash deployment/tools/travis-build.bash
```
Not much to it!

The ```travis-build.bash``` script prepares environment variables required by Docker Compose, then invokes docker compose up. For details, look in *deployment/tools/travis-build.bash*. 

[1] First, a few <a href="https://docs.travis-ci.com/user/environment-variables" target="_blank">standard Travis environment variables</a> are exported into environment variables expected by the common Docker Compose file (docker-compose.yml).

[2] Then, the build date is calculated and exported into the environment; this is also an expected environment variable.

[3] Then, the *BUILD* variable is populated based on the current branch. Only *develop* and *master* branches are supported. In fact, Travis should only be triggered by merges into develop and master.

The ```BUILD``` variable determines which kbase-ui build configuration is used. See [build configurations](../development/build-configurations.md).

[4] Finally, Docker Compose is invoked in the standard mode to build but not run the specified image.

```bash 
docker-compose up --no-start
```

If you are familiar with Docker Compose, you know that it will expect to find a file named *docker-compose.yml* in the current directory.

This will result in an image named ```kbase/kbase-ui:develop```, with *develop* determined by the current git branch.

Travis is also instructed to copy the image to dockerhub. This is accomplished by a 

### deployment



## Production

## build

```bash
BUILD=prod bash tools/docker/travis-build.bash
```

> BUILD=ci docker-compose -f docker-compose-travis.yml up --no-start --build

This will result in an image named ```kbase/kbase-ui:master``` (if that was the travis branch)



## Local Development

BUILD=dev DEPLOY_ENV=dev docker-compose -f docker-compose-dev.yml -f docker-compose-dev.override.yml up

BUILD=dev DEPLOY_ENV=dev docker-compose -f docker-compose-dev.yml up --build

will build kbase-ui, kbase-ui-proxy, and start them at ci.kbase.us

BUILD can be dev, ci, prod 
DEPLOY_ENV can be dev, ci, next, appdev, prod



Fake Travis

To test the travis build:

BUILD=dev bash tools/docker/fake-travis-build.bash

This build is "fake" because instead of being made in the presence of real travis environment variables, the required travis variables are created directly (via git). But it uses the travis docker compose file.


Real Travis

In ci:



For prod:

BUILD=prod docker-compose -f docker-compose-travis.yml up --no-start --build

This will result in kbase/kbase-ui:master (if that was the travis branch)

TODO: what about kbase/kbase-ui:vX.Y.Z where X.Y.Z is the git tag, the kbase-ui version.