# Installation

There are four basic build scenarios:

- development
- production 
- release
- deployment

The *development* build creates a complete usable KBase UI system, but code is not fully optimized. It is suitable for development of the UI or of plugins being developed for integration into it. It is also the right build to use for running and developing tests.

The *production* build is additive to the development build, in that if first creates a development build, and then creates and optimized set of production-ready files. This build step is separated from development becuase the creation of production-ready files can be time consuming.

The *release* build contains optimizations, especially to improve load time, including minification and concatenation. It also runs all tests and code quality checks, so that a release may not be built unless all tests and code quality checks succeed.

Finally, the *deployment* build will create a release build and then install it into the target system. The only deployment environment currently supported is the KBase runtime environment.

These scenarios are supported by specific build parameters, which are covered in more detail in the [building](building.md) documentation.

## Preparation

All installations require the following steps:

### 1) Create a working directory

For development, you will want to create a directory to contain the *KBase UI* code, as well as any other code you are working on, such as plugins. The [development](development.md) documentation describes development issues in depth.

```
mkdir -p work/kbase-ui-work
cd work/kbase-ui-work
```

For a more ephemeral installation, in which the repo will only be used for a short period of time, either to install a release or to run tests, the install directory can simple be something like

```
mkdir kbase-ui-temp
cd kbase-ui-temp
```

### 2) Clone the kbase-ui repo

```
git clone https://github.com/kbase/kbase-ui
cd kbase-ui
```

### 3) Prepare the repo

The repo relies on Javascript node modules for all tasks. Before using these tools, you first need to install their dependencies. This is accomplished with

```
make init
```

> At the time of writing, KBase UI consists of a master branch and tagged commits. The procedures described herein do not cover switching between branches or tags.

## Development

The developer build is the basis of all other builds, and is the default. There are developer settings which allow you to build with local copies of modules (plugins or otherwise), in which case the build diverges from others. In any case, the build consists of the entirety of KBase UI, plus all dependencies and plugins installed. The app is fully runnable with this build.

### 1) Build it

In the default configuration, building will create only the developer build:

```
make build
```

> See the [development](development.md) docs for integration of local modules

### 2) Start It

All builds may be directly run using the provided nodejs http server. They may also be "run" using any web server, so if you have a preferred method of previewing web sites, etc. you may use that instead.

The integrated nodejs http server is located in *dev/server*, and may be started with 

```
make start &
```

By default the server will run against the developer build (dev/build), but can also run against the production build (dev/prod). This is configured through build.yml.


### 3) Use it

The server may be run from https://localhost:PORT, where PORT defaults to 8888 but may be configured in dev/config/build.yml. However, there is of course a make task for this which reads the config file and launches the system default browser pointing to the server.

```
make preview
```
### 4) Stop it

When done, you can stop the server through a stop task. It uses the port in the build.yml config file to locate and kill the process.

```
make stop
```

### 5) Test it

After a successful build, you may want to run a quick test as a sanity check. This is not meant to replace the test process.

```
make test
```

Or directly like this:

```
karma start dev/test/karma.conf.js
```


## Production Build

The production build may be installed in very much the same way as the development build, but with additional arguments supplied to the requisite make commands. The production build uses the *prod* UI configuration, the *prod* Services configuration, and also creates an optimized build called the *dist* (short for *distribution*).

### 1) Build it

```
make build prod prod
```

This will use the configuration sets for production UI (first argument) and production Services (second argument).

The end product will be two installations of the KBase UI, ```dev/build```, which is the normal developer build as described above, and ```dev/dist``` which is the optimized distribution build. Note that this is not the same as the release distribution, which is specially packaged for placement into a release branch, and is directly usable without any build steps.

> For more about building, see the [Build Guide](building.md).

## Release Installation

Finally we come to the installation of a release. A release is distributed through the *release* branch of the *kbase-ui* repo, and contains a pre-built distribution build in an archive format.

> This section to be done, since we haven't worked this out yet, and do not actually have a release branch.

