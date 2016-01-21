# Development Guide

## Build Directories

The build process is run by Javascript code running under Nodejs. This code is installed within the top level */mutations* directory. All temporary files are created within the */mutations/mutantfiles* directory. Each build creates a new uniquely named build directory within mutantfiles. Within the build directory are a set of temporary directories representing a build stage. These directories are preserved by default since they can be used to debug problems with the build process itself.

> This will change soon so that the build directories are deleted at the end of the build process, but may be preserved through a build option

In addition, the top level */dev* directory contains development tools as well as the current development build ( */dev/build* ) and distribution build ( */dev/dist* ) products. This is the location in which the preview server expects to find the files.

## Customizing the Build

The development build utilizes the top level */dev* directory for customer developer configuration.

The developer preferences are the key to overriding the built-in build configuration without needing to alter them. It is problematic to have developers modify configuration within the project as part of their workflow, because it is too easy to propagate these changes into the project. 

The build process and other related apps (deploy, server, preview) honor the developer configuration override.

For now this process is manual. In order to provide the developer custom config, just copy the top level */config* directory into the top level */dev* directory.

```
cp -pr config dev
```

<!-- The initial development build (or the *make dev* process) creates a set of configuration files within */dev* and uses them instead of the source configuration located in */config*. If the */dev/config* directory is deleted, it will be replaced upon the next build with the default files. -->

<!-- that bit is actually still to be done. Currently one DOES need to modify /config in order to tweak the build env -->

### Plugins

Plugins that are to be loaded into the ui must be registered in the *config/ui/TARGET/build.yml* file. This file contains entries for plugins and modules which are made available to the UI outside of the normal bower package installation process.

Note that by default the TARGET for development (and the default in general for just plain building) is *dev*. Thus the build configuration file is located in *config/ui/dev/build.yml*.

The plugin section of this config file contains one entry per plugin to be loaded into the kbase ui runtime. There are three types of entries: internal, external from bower, external from local files. All plugins are eventually installed into the modules/plugins directory of the kbase ui filesystem. The configuration entries provide the build system with enough information to move the files into place.

#### internal

Internal plugins are already located in the base source tree under src/client/modules/plugins. The only information required by the builder is simply the string which matches the directory name, and which also serves as the plugin id. The builder uses the plugin id as an entry in the plugin load configuration (a part of the kbase ui app load process), but does not need to move any files since they are already located in the base filesystem.

#### from bower

Plugins may also be built into the kbase ui through Bower. With Bower the plugin code is located on github, registered in the Bower registry, and referenced by the bower id (which is also the repo name) and the version. Bower understands semantic version and query expressions, but we prefer to fixed version strings (i.e. without modifiers.) This makes a more predictable build.

The entry for a plugin installed via Bower looks like:

```
    -
        name: dashboard
        bower:
            name: kbase-ui-plugin-dashboard
            version: 0.1.1
        copy:
            path: src/plugin
```

- ```name``` is the plugin name, which is also used as the directory name when it is installed into modules/plugins.
- ```bower.name``` is the name registered with Bower and also the github repository name.
- ```bower.version``` is the Bower version and git version tag
- ```copy.path``` tells the build process where to find the plugin within the package; it defaults to dist/plugin if not provided


### from a directory

During the development process, with most tools, development of a plugin through github and bower is inefficient. It is possible to install via Bower from the latest commit to a github branch, e.g. master. A possible workflow is:

```
edit > save > commit > push > bower update > build > reload
```

This may seem like quite a lot of work for making a change and testing it, and when many such tasks are strung together it certainly can be. Good tooling can help. But still ...

So to assist in this type of workflow there is a plugin configuration entry which will pull the plugin from a local directory rather than through bower. Because it is a local copy, it is very fast. The workflow looks like this:

```
edit > save > build > reload
```

At present, the build step is necessary, and it does add several seconds to the development cycle. In the future there will be optimized build processes just for plugin development. These could either copy just the development plugin into the appropriate modules/plugin directory, or even link the plugin directory in the build to the location of the development plugin. The latter technique has been used, and certainly can be set up by hand, but we have not developed a set of configurations and corresponding build process modifications to support it.

```
 -
        name: datawidgets
        #bower:
        #     name: kbase-ui-plugin-datawidgets
        #     version: 0.1.2
        directory:
            path: ../kbase-ui-plugin-datawidgets
        copy:
            path: src/plugin
```

- ```name``` is the plugin name, which is also used as the directory name when it is installed into modules/plugins.
- ```directory.path``` is the location of the top level plugin directory, corresponding to the repo directory, relative to the kbase-ui project directory.
- ```copy.path``` tells the build process where to find the plugin within the package; it defaults to dist/plugin if not provided

Note that if a plugin is being updated, and it already exists in Bower and github, it is good to just comment out the bower configuration until you are ready to create and push a new tag, and then switch back to the updated bower config for final testing.

> Note - if you saw a link property in an earlier version, or happen to see such references before they are finally cleaned up, this feature started as a link to the plugin directory. Bower has a link feature which we could piggyback on. However, such links do not survive the various transformations that the source filesystem undergoes. Our improved plugin linking will have to be applied at the level of the built filesystem.

### Modules

[ to be done -- will describe how the modules config is used, and how modules are imported into kbase ui]


### KBase's special handling of bower packages

[ to be done ]