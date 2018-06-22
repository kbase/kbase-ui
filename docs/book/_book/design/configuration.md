# KBase-UI Configuration

kbase-ui is designed to be configurable in all the right places.

Configuration is key to each phase of working with kbase-ui:

- installing tools
- building 
- deploying
- running

The files:

- config
  - app
    - dev
      - plugins.yml
      - services.yml
    - prod
      - plugins.yml
      - services.yml
    - ui.yml
  - build
    - configs
      - dev.yml
      - ci.yml
      - prod.yml
    - defaults.yml
  - deploy
    - appdev.env
    - ci.env
    - dev.env
    - next.env
    - prod.env
  - bowerInstally.yml
  - npmInstall.yml
  - release.yml
  - services.yml

## Base Tools

The core OS dependencies are not configurable. Certain system [prerequisites](../prerequisites.md) must be manually installed in order to have adequate local functionality to work with kbase-ui

> We do hope to reduce all depencies down to a Docker, so that even the base tools would be provided by configuration, the Dockerfile.

## Installing Tools

Once the core system dependencies are in place, the ```system.json``` file located at the root of the kbase-ui repo provides a list of all tools required to build and test kbase-ui. There is seldom a need to alter ```system.json``` and nothing to be done for a typical working session or deployment.

## Building

kbase-ui relies upon a set of configuration files to control the contents of and the manner in which the app is built.

### builds

The `builds` directory contains the top level build configurations. Configuration-wise, it is the entrypoint to building the ui.

Two files are consulted for a build; they are merged together to form the build config. The *defaults.yml* file contains the basic build default settings. It is rarely changed, but is useful for debugging the build itself. The second file is one of the files within `build/configs`. This latter file is used to determine certain characteristics of the build and build process.

In practice the config files are invoked with the *build* make task using the *config* argument. For example,

```bash
make build config=dev
```

builds the ui using the build/configs/dev.yml build config, and implicitly the builds/defaults.yml.

#### defaults.yml

The defaults.yml file supports the following settings:

- tempDir - (string, directory) where to place the build working files; usually

- mutate - (boolean) whether to use the immutable or mutable method of building

- keepBuildDir - (boolean) whether to remove the working build dir (in tempDir) or not

##### tempDir

During the build process, kbase-ui copies all source files and dependencies, places them into their final destinations, combines configurations, and so forth. Because this process can produce a lot of disk activity and may even leave behind build artifacts (depending on other build options used), this setting allows one to specify where that temp dir is located.

The preset value is *temp/files*, and is thus located within the repo, but this may of course be overridden and does not affect the build product.

##### mutate

The *mutate* flag determines whether the build tool will create a copy of the build directory at each primary build step (false) or not (true). 

The value defaults to *true*.

One of the original features of this build tool is that in order to assist in debugging the build process, each step which creates, deletes, or changes files first makes a copy of the entire build directory. This can be especially useful when incorporating new dependencies or transformations because it enables one to inspect the file contents before and after a transformation has been applied. 

In practice the build is rarely operated in immutable mode, but it is very useful when needed.

##### keepBuildDir

Normally the build working directory, located in tempDir, is removed at the end of the build process. If the build fails, the directory is always left intact, for inspection. However, at times it can be helpful to inspect the build working directory to diagnose a build malfunction (in which it succeeds but does the wrong thing). Usually this would be in combination with setting *mutate* to false.

The default value is false.

#### builds/{build}.yml

Alongsize the build defaults config is a build target config. This allows for controlling characteristics of the build for different build use cases. 

Located inside ```build/configs```, each file describes a set of build settings for a given build scenario. The *dev* config is best for local development, *ci* for building for the CI environment, and *prod* for the build meant for deployment in one of the production environments - next, appdev, and production itself.

The following settings are supported:

- target - (string) the app type to build, either dev or prod
- release - (boolean) whether the build is a release (with new version, release notes) or not
- dist - (boolean) whether to build the distributable production files (minified)
- vfs - (boolean) whether to build the virtual file system, a bundle of javascript and other files

##### target

The target corresponds the set of configuration files which control the contents of the built kbase-ui. The target value corresponds to the base file name located in config/app. At present two targets are supported, *dev* and *prod*. The dev ui is used for local development. It contains several features not available in the prod build, primarily to assist in local development. It also may contain highly speculative features which should not appear in any version of a production deployment. 

In the past a *ci* target supported new features which were to be deployed only in CI for review. The *prod* build only contained features which were completely ready for users.

The new approach at KBase is to "release" features into the kbase-ui app as soon as they are minimally useful. Even if not ready for users and available in the menu, they will be present in the app code itself.

##### release

Determines whether the build is handled as an app release or not. An app release involves checking that the repo head is tagged, that the tag has a semver format, that the tag matches the release stamp (config/release.yml), and that release notes are available for that version. Other quality control checks may be put in place.

The purpose of the release flag is to allow local development and CI builds to proceed at a rapid clip, yet to ensure that the released app is tied up into a nice package.

##### dist

The dist flag determines whether the build applies extra validation and optimization to the app. It results in a separate directory tree; the primary build product is located in build/build, the dist build is located in build/dist.

The primary purpose of the dist build is to produce smaller files, via the process known as "minification". It can also can be considered more generally optimization because the minification tools parse the source code into AST, and rewrite the code with certain optimizations, such as inlining, variable renaming, omission of comments, and in some cases dead code eliminitation. Since all javascript code is parsed, it must be syntactically valid, so this is also a code verification step.

Since it is a lengthy process, this code compilation stage is disabled for the *dev* build target; but enabled for *ci* and *prod*.

##### vfs

Another optimization for deployed builds is the AMD virtual filesystem. This is rather simple, actually just a very large map of path to function or value (string or object). When this flag is set, the build tool creates this large map, saves it to the build and modifies the apps primary "index.html" file to load it. A modified version of the module loader will preferentially load modules from the pre-loaded VFS and avoid network calls. This improves performance (at the cost of initially loading the VFS) and stability (fewer module loading errors during spotty network conditions.)

The *vfs* flag is set to false for dev, and true for ci and prod.

## app

The *app* directory defines the runtime features and behavior of kbase-ui. It accomplishes this through three configuration files.

- ui.yml - the core ui configuration across all environments
- {ui-type}/plugins.yml - defines plugins to be installed and loaded 
- {ui-type}/services.yml - defines ui services to be loaded and configuration options

Two ui-types allows different versions of the ui to be created, containing different capabilities through

### ui.yml

The primary ui configuration file defines constants for global ui features, as well as ui services. This file provides default behavior, and also a location to store constants to avoid hardcoding them.

{ui-type}