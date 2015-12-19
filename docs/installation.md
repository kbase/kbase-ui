# Installation

These installation and build instructions cover the easiest out of the box experience to get the KBase UI up and runnning. Each section provides pointers for more information on each of the procedures.


## 1) Clone the kbase-ui repo

Make yourself a nice cozy home in which to place kbase-ui. For testing and development you just need a single directory owned by you.

```
mkdir -p work/kbase-ui-work
cd work/kbase-ui-work
git clone https://github.com/kbase/kbase-ui.git
cd kbase-ui
```

## 2) Build it

The kbase-ui can build with a couple of lines typed at the console, or a single invocation of ```make```.

The default build uses the developer UI and the CI KBase services, but you can change this by supplying arguments to *make*. For a default developer build:

```
make build
```

If you wish to create a production build

```
make build prod prod
```

This will use the production UI (first argument) and production Services (second argument.)

In either case, the build will be placed into ```dev/build```.

> For more about building, see the Build Guide.

## 3) Run tests

Tests can be run directly with karma, or through the make process

```
karma start test/karma.conf.js
```

or

```
make test
 ```

or 

```
grunt test
```

## 4) Local Deploy for development and testing

The build process creates build directory which can be used directly as a web site root. 

You may use the server of your choice, or use the built-in mini-web-server via

```
grunt preview
```

## 5) Production Deploy

The production deploy just copies the build directory to the appropriate location.

