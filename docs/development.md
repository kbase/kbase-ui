# Development Guide

## Build Directories

The build process is run by Javascript code running under Nodejs. This code is installed within the top level */mutations* directory. All temporary files are created within the */mutations/mutantfiles* directory. Each build creates a new uniquely named build directory within mutantfiles. Within the build directory are a set of temporary directories representing a build stage. These directories are preserved by default since they can be used to debug problems with the build process itself.

> This will change soon so that the build directories are deleted at the end of the build process, but may be preserved through a build option

In addition, the top level */dev* directory contains development tools as well as the current development build ( */dev/build* ) and distribution build ( */dev/dist* ) products. This is the location in which the preview server expects to find the files.

## Customizing the Build

The development build utilizes the top level */dev* directory for tools, build products, test results, and developer preferences.

The developer preferences are the key to overriding the built-in build configuration without needing to alter them. It is problematic to have developers modify configuration within the project as part of their workflow, because it is too easy to propagate these changes into repo. 

The initial development build (or the *make dev* process) creates a set of configuration files within */dev* and uses them instead of the source configuration located in */config*. If the */dev/config* directory is deleted, it will be replaced upon the next build with the default files.

> that bit is actually still to be done. Currently one DOES need to modify /config in order to tweak the build env

### Using a Local Plugin

> to be done

### Using a Local Module

> to be done
