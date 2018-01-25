# Build configuration files

The build configuration files, located in ```build/configs```, provide essential controls over how the build tool creates the resulting web app.

This directory contains one yaml config file per build "type". Each build type at present represents a type of deployment environment - development, continuous integration and testing, production.

The config file is selected when invoking the build command by providing the ```config``` optional argument. The value defaults to ```dev```.

E.g.

```
make build config=ci
```

builds the CI version of the KBase UI.



The build config provides controls over the shape and features of the resulting web app.

## Config Keys

### target

THe target property switches to another set of ui config files located in ```config/ui/<target>```. The value is a string and completes the path. Currently ```dev```, ```ci```, and ```prod``` are supported.

The target configuration files provide menu, ui services, and pugin configuration. These are the main building blocks of the ui, so this configuration is the primary definition of "what is in" the web app. The way we utilize this now, the number of features diminishes from dev -> ci -> prod. This is because the features removed are either development tools or features in development but not ready for production yet.

### temp

Defines where to store temporary files during the build process

### debug

If set to true, the build directory will not be removed after the build completes. This is useful for tracing problems constructing the build. It is rarely used.

### dist

If true, causes the distribution build to be created in addition to the source build. The regular source build is placed into <repo>/build/build; the dist build into <repo>/build/build. The only difference between the builds is that the dist build is subjet to minification. This includes the vfs, which is created after minification. An implication of minification is syntactic errors may also the build.

This option is typically enabled for CI and production, since minification greatly increases the build time.

### vfs

If true, causes the "virtual file system" (vfs) to be build and enabled in the primary index.html app loader. The vfs is a a map of path to module asset for most assets which may be loaded by the requirejs amd loader. A special version of requirejs will consult the vfs before loading the resource from the network.

This option is typically enabled for CI and production, but not development since its usage makes debugging difficult.

## Example

```yaml
## Global Build Config
---
# which ui config to use in config/ui/<target>/*.yml
target: ci

# Where to store temporary build files.
temp: ../temp

# If true, the build process will not remove the run_ directory post-build.
debug: false

# If true, causes a minified version to be built in build/dist
dist: true

# If true, casuses the vfs file to be built and loaded in  index.html.
vfs: true
```
