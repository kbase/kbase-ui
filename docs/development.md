# Development

## Prerequisites

- docker
- make
- sh-compatible shell

## Quick Start

```shell
make start-dev-server
```

## Working with the Code

## Development Architecture

### Developing in Container

It may seem strange at first to run the react app inside a container. After all, a create-react-app managed web app has a simple, well-known set of `npm` commands for running, testing, etc.

There are several benefits, however, to running inside a container:

#### dependencies disentangled from development host

The web app has a specific set of requirements which may conflict with one's host machine. The primary such dependency is `node` and all of the node packages. Of course, there are virtual environments for node, as there are for other scripting languages like python and ruby, meant to help a developer set up an environment with a specific language runtime version with a specific set of dependencies.

#### package-lock and host

Some node dependencies include binaries. Yes, the `npm` installer does recognize the host operating system and installs the correct binary. However, using a package-lock.json and even more so an existing node_modules between operating systems can introduce problems, due to binary incompatibility and choices made in dependency resolution based on the operating system.

#### matching production

The development server uses the same Docker image configuration (not the same Dockerfile, though), so the resulting operating system and its dependencies are identical. This reduces the number of differences between development and deployment, again removing an area of concern and occasional bugs.

## Working on the dev server

Although the general workflow of working with the web app in the container is as simple as the Quick Start demonstrates, there are times when one needs to dig into the container in order to perform system-level tasks. The primary such task is updating node dependencies.

Due to the directory layout of a create react app, only the react-app/src directory is volume mounted into the container. This leaves the 


```shell
docker run -it --hostname=kbase-ui --entrypoint=sh --network=kbase-dev -p 3000:3000 -e CHOKIDAR_USEPOLLING=true  -v `pwd`/react-app/src:/kb/deployment/app/src -v `pwd`/build/dist/modules/plugins:/kb/deployment/app/modules/plugins  kbase-ui-dev:dev
```