# Local Build

The local build uses `make` to automate tasks, which are captured in shell scripts. Most shell scripts run node or deno scripts within docker containers.

## Prerequisites

Make sure you have the following available:

- make
- docker

## Quick Start

```shell
make
make build-image
```

Where

`make` prepares and copies all required code and assets into the `build` folder.

`make build-image` creates the docker image containing kbase-ui, plugins, and nginx.

Let's tease this apart.

## Build Folder

All build products are placed in the `build` directory. `build/dist` contains the web app itself (copied from `react-app/build` after compilation), and `build/plugins` contains all of the kbase-ui plugins.

## Build Steps

1. install node dependencies in react-app
2. run the Create React App (CRA) build script in react-app
3. install plugins into build folder `build/plugins`
4. copy the CRA build to `build/dist`
6. create image from `Dockerfile` as `kbase/kbase-ui:dev`

Let us run through each step:

### 1. install dependencies

Dependencies are installed by invoking the node runner (`tools/node`) [ 1 ](#1). They are installed via the node runner is to ensure that they are installed with Linux (regardless of the host os).

### 2. build the app

The web app itself is built using the CRA build script via the node runner. The results of the build are placed in the usual location, `react-app/build`.

### 3. Install plugins

All kbase-ui plugins are available in public github repos named `kbase-ui-plugin-PLUGIN`, where `PLUGIN` is the plugin name.

The are installed through the configuration file `config/plugins.yml` by cloning the repos, unpacking the installation archive, and placing the result in `build/plugins/PLUGIN`.

### 4. Copy app to build folder

The web app built in (3) is copied to an empty directory `build/dist`.

### 5. Create image

The `Dockerfile` at the root defines the image. It is a simple Alpine-based image which contains:

- the app installed in `/kb/deployment/app`
- the deployment templates in `/kb/deployment/templates`
- the deployment scripts in `/kb/deployment/scripts`
- the plugins in `/kb/deployment/plugins`
- `dockerize` to handle config and nginx templates
- `nginx` to serve the web app files

And is preconfigured to launch nginx.


## Notes

### 1
The node (`tools/node`) and deno (`tools/deno`) script runners are small docker compose configurations which are designed to run arbitrary scripts and to have a host folder made available for accessing files for reading and writing.