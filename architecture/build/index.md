---
---

# Build System

`kbase-ui` uses a custom build system implemented primarily as a set of javascript files and run by `nodejs`.

Since the build involves a lot of file copying and manipulation, it can be difficult to investigate the cause of errors. This was especially true when creating the build process. So the build uses a set of checkpoints by cloning the set of build files before every major build step. This can aid in debugging because the state of the files can be inspected at any build stage.

The build system design features:

- implemented in two files, `build.js` which contains the main build logic and `mutant.js` the support library.
- the entrypoint and all dependencies are specified in the single project `package.json` file.
- the build is broken down into asynchronous steps, clearly laid out at the bottom of `build.js`
- at each step, the entire state of the build filesystem is cloned
- the end result is a set of files is installed in a `build/dist`

## TL;DR

A kbase-ui build is usually conducted within a Docker container, in which all of the build dependencies are specified. A build may also be performed directly on the host machine, but since development workflows require running kbase-ui inside of a container, it is not directly supported.

For a developer, a build is kicked off with `make dev-start`, but we are going to focus on the actual build process inside the container. This process starts with

```bash
make build BUILD
```

where `BUILD` is the name of the build configuration, either `dev`, `ci`, or `prod` (more on the build envs later), which defaults to `dev`.

The build proceeds, printing many messages to the console, and finishes by installing the final build products in `/build/dist` and `build/test`. The `/build` directory is reserved in the repo through the presence of `/build/README.md`, and is excluded from git in `.gitignore` to prevent checking in build artifacts.

## The Steps

1. Create initial build filesystem by specifying all of the initial source files to be gathered:
    - src/client
    - src/plugins
    - src/test
    - package.json
    - release-notes
    - config

2. Following are the major steps in the build. Each of these steps can be found in `mutations/build.js` toward the bottom of that file:
    - STEP 1. Generate the build config from:
        - config/build/defaults.yml
        - config/build/BUILD.yml, where BUILD is dev, ci, or prod (defaults to dev)
    - STEP 2. setupBuild  
       prepare the build file system
        - remove extraneous files like .DS_STORE
        - move src/client to build/client
        - move src/test to test
        - move src/plugins to plugins
        - move package.json into build/package.json
        - remove src
    - STEP 3. installNPMPackages  
       Install NPM packages with YARN
        - perform a standard yarn install
        - using config/npmInstall.yml, copy just the required files into build/client/modules or build/client/modules/node_modules
    - STEP 4. removeSourceMaps  
       Remove source maps in any .js or .css files
       This simply prevents annoying browser console messages in 3rd party code (npm packages) built with source mapping. Source mapping is not consistent across them, so it is simpler to just abandon it rather than partially support it.
    - STEP 5. fetchPlugins  
       Download plugins from github
        - download plugins from github into gitDownloads
        - create a plugin.json config file for kbase-ui
    - STEP 6. installPlugins  
       Extract and move into place
        - installs external plugins from their dist.tgz
        - copies internal plugins directly
        - all plugins installed into build/client/modules/plugins/NAME, where NAME is the plugin name
    - STEP 7. makeUIConfig  
       Creates the core ui config file, ui.json, and stores it in the state
       - creates build/client/modules/config/ui.json
    - STEP 8. createBuildInfo  
       Creates a config file containing build-time information, including
       - the build target
       - build stats
       - git info
    - STEP 9. verifyVersion  
       If this is a "release" build, will verify that:
       - there is a semver git tag present
       - there is corresponding it matches the value in the ui config key `release.version`
       - there is a corresponding release notes file in release-notes/`RELEASE_NOTES_{VERSION}.md`, where `VERSION` is the git tag without the `v` prefix.
    - STEP 10. makeConfig  
        This step creates the main config file and build-info.js
        - merge ui.json and buildInfo.json and store in build/client/modules/config/config.json
        - build-info.js contains key build information for usage in kbase-ui before the module system kicks in.
        - it is used specifically to provide the git commit hash for usage as a cache-busting key for the module loader
    - STEP 11. addCacheBusting  
        Adds a cache-busting url query parameter to index.html, load-narrative.html, overwriting the original files in the build filesystem.
    - STEP 12. cleanup  
        Clean up build artifacts
        - node_modules
    - STEP 13. makeRelease  
        If this is a release build:
        - minify all .js files
    - STEP 14. makeDist  
        Copies the build files from working directory to the final destination
        - copies into build/dist
        - includes:
            - config/
            - build/
            - test/
    - STEP 15. makeModuleVFS  
        Create the Virtual File System (VFS) if specified in the build config.
        If the build config sets the `vfs` flag, the VFS will be built and enabled in index.html.

## Files

- `mutations/build.js` - the top level build script which implements the build logic
- `mutations/mutant.js` - support library implementing core logic and utilities
- `package.json` - installs dependencies, runs scripts
- `Gruntfle.js` - contains a clean task to clear out build artifacts
- the build config files located in `config/build`
  - `defaults.yml` default config settings
  - `dev.yml` - build configuration more suitable for local development
  - `ci.yml` - build config more suitable for building a Ci image (not minified, no vfs)
  - `prod.yml` - build config more suitable for building a production image (minified, vfs)
- `Dockerfile` - not required by build, but typically a build is conducted within a Docker container.

## Command Line Options

[ TODO ]

## The Process

[ TODO ]
