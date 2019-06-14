## Tools

### make dev-start

The general form of the dev-start tool is:

```
make docker-compose-up [build=BUILD] [env=ENV] [plugins="P1 P2"] [internal="I2 I2" [libraries="L1 L2"] [paths="T1 T2"]
```

#### Build Options

`build` specifies the type of kbase-ui build (dev, ci, prod) and defaults to "dev".

`build` specifies the runtime or deployment environment (dev, ci, next, appdev, prod); it defaults to "dev".

The *build* option controls various attributes of the kbase-ui build. The "dev" build is for local development, and all that we are interested in at this stage. (See [builds](../design/builds.yml) for more information on differences between the builds.)

#### Docker Compose Override Options

In order to make the local code available in the docker container in which kbase-ui will be running, we need to use a special tool to create what is known as a Docker Compose override file. The override file has the same schema as the standard Docker Compose file, but is used to override or extend any settings in it. Essentially, the override file is merged into the regular config file, replacing or extending entries.

We use this feature to "bind" mount directories or files into the kbase-ui container.

The development docker compose files are located in `dev/docker-compose.yml` and `dev/docker-compose.override.yml`. Note that the override file is ignored by git.

E.g. 

``make dev-start plugins="dataview catalog"
```

### Starting a work session

```
make docker-compose-override [plugins="P1 P2"] [internal="I2 I2" [libraries="L1 L2"] [paths="T1 T2"]
make docker-service-start  build=BUILD env=DEPLOY_ENV
```

#### docker-compose-override

The `docker-compose-override` task will, according to the options you provide it, build a Docker Compose override configuration file, typically named "docker-compose.override.yml". This file is placed in the `dev` directory in the kbase-ui directory. 

The override task allows you to map into the container local copies of a plugin, an internal plugin, a library, or any arbitrary path within kbase-ui. This mechanism allows you to "run" kbase-ui inside the container, while being able to modify local source files and have the changes appear inside the container.

##### plugins

A space separated list of external plugins to map into the kbase-ui container. Note that the plugins must already be installed inside the container. That is, a new plugin must already be configured and built into kbase-ui in order for its local doppleganger to be able to map over it.

E.g.

```
make docker-compose-override plugins="dataview catalog"
```

will map the dataview and catalog plugins into the container.

The expected directory structure is

```
project-root
  kbase-ui
  kbase-ui-plugin-dataview
  kbase-ui-plugin-catalog
```

The resulting override file would look like this:

```
version: '3.6'
services:
  kbase-ui:
    volumes:
      - type: bind
        source: >-
          /Users/erikpearson/work/kbase/sprints/2018Q3S1/kbase-ui/../kbase-ui-plugin-dataview/src/plugin
        target: /kb/deployment/services/kbase-ui/dist/modules/plugins/dataview
      - type: bind
        source: >-
          /Users/erikpearson/work/kbase/sprints/2018Q3S1/kbase-ui/../kbase-ui-plugin-catalog/src/plugin
        target: /kb/deployment/services/kbase-ui/dist/modules/plugins/catalog
```

Note that `source:` references the local plugin source directory, and `target:` references the corresponding source directory *inside* the container.

##### internal

Internal plugins are, at the source level, identical to external plugins. They are included with the core kbase-ui code because they are integral components of the ui layout.

The mapping process is very similar, except that the source directory is located within the kbase-ui codebase:

E.g.

```
make docker-compose-override internal_plugins="mainwindow"
``` 

results in the override file:

```
version: '3.6'
services:
  kbase-ui:
    volumes:
      - type: bind
        source: >-
          /Users/erikpearson/work/kbase/sprints/2018Q3S1/kbase-ui/src/plugins/mainwindow
        target: /kb/deployment/services/kbase-ui/dist/modules/plugins/mainwindow

```

##### libraries

The override tool also allows you to work on kbase Javascript libraries. The ui and plugins rely upon a small set of javascript libraries to provide common functionality, including:

- kbase-common-js, aka "kb_common"
- kbase-common-es6, aka "kb_lib"
- kbase-common-ts, aka "kb_common_ts"
- kbase-knockout-extensions-es6, aka "kb_knockout"

All of the kbase libraries follow the AMD pattern of using a single module root and loading modules by filename. Thus "kb_lib/html" refers to the "html.js" file within the kbase-common-js codebase, which is installed under the module root name "kb_common".

Libraries come in two varieties, compiled and non-compiled. Compiled libraries typically are distributed in the "dist" directory, and non-compiled in the "src". Thus the override option for libraries requires that one specify the location of the library source within the library's root directory.

E.g.

```
make docker-compose-override libraries="common-es6:src:kb_lib common-js:dist:kb_common"
```

which results in the override file 

```
version: '3.6'
services:
  kbase-ui:
    volumes:
      - type: bind
        source: >-
          /Users/erikpearson/work/kbase/sprints/2018Q3S1/kbase-ui/../kbase-common-es6/src
        target: /kb/deployment/services/kbase-ui/dist/modules/kb_lib
      - type: bind
        source: >-
          /Users/erikpearson/work/kbase/sprints/2018Q3S1/kbase-ui/../kbase-common-js/dist
        target: /kb/deployment/services/kbase-ui/dist/modules/kb_common
```

##### paths

Finally, the `paths` option allows you to override any arbitrary path within kbase-ui. This is handy for live editing of core code, including core logic and ui services.

Note that while most kbase-ui core code is simply copied into the build destination, configuration files are assembled and placed into the build, and will not be found in the source and cannot be overridden.

Note that in the kbase-ui codebase, the root for all source paths is `src/client`, so your paths should start there.

E.g.

```
make docker-compose-override paths="modules/app/services mustard.js"
```

which results in the override file

```
version: '3.6'
services:
  kbase-ui:
    volumes:
      - type: bind
        source: >-
          /Users/erikpearson/work/kbase/sprints/2018Q3S1/kbase-ui/src/client/modules/modules/app/services
        target: /kb/deployment/services/kbase-ui/dist/modules/modules/app/services
      - type: bind
        source: >-
          /Users/erikpearson/work/kbase/sprints/2018Q3S1/kbase-ui/src/client/modules/mustard.js
        target: /kb/deployment/services/kbase-ui/dist/modules/mustard.js
```

Note that this allows the overriding of entire directories as well as individual files.

#### docker-compose-start

#### docker-compose-clean

### Stopping a work session

```
make docker-service-clean
```

## Use Cases

### Common

- work on a plugin
- edit documentation
- testing

### Rare or Advanced

- create a plugin
- update dependencies
- work on a library

## Command Reference

### make docker-service

### make docker-service-clean

### make docker-network

### make docker-network-clean

### make integration-tests

### make unit-tests

### make docs

### make docs-viewer
