# New KBase UI Build

`kbase-ui` is now a Create React App (CRA) project, and as such it is bundled, and developed using the standard CRA tools.

The build process is not significantly simplified, from the KBase point of view (and much more complex processes hidden by the CRA toolset).

## The Process

- clean out:
  - build
  - build the web app, creating a bundled web app linked into the initial index html file.
  - `sh scripts/shell/build.sh`
  - this runs tests at the same time
  - note that this does a clean-install.
- copy built web app to the `build` directory.
  - `sh scripts/shell/copy-build.sh`
  - all build assets are placed in the `build` directory.
- download and prepare plugins, installing into the public root of the web app
  - `sh scripts/shell/install-plugins.sh`
- build a docker image containing the web app, an nginx server, and config templates
- config templates for:
  - nginx server
  - kbase-ui configuration

in the GHA build, the workflow takes care of building the image.

for local consumption:

- make the image:
  - `sh scripts/shell/build-image.sh`

- run the image:
    - `sh scripts/shell/run-image.sh`



docker-compose --rm up

which take the following environment variables:

deploy_environment - the environment identifier: ci, next, prod, narrative-dev, narrative-refactor
deploy_hostname - the hostname for the current deployment; can be anything but generally ci.kbase.us, next.kbase.us, etc.
deploy_icon - the font-awesome icon name; it is the icon class without the fa- prefix; e.g. "flask" for "fa-flask"
deploy_name - the human-readable name for the deployment; e.g. CI, Next, 

deploy_ui_hostname - if different than deploy_hostname, aka, in prod
ui_backupCookie_domain - (optional) - if a second (backup) cookie is to be created, the domain (only used in prod)
ui_backupCookie_enabled - (optional) - "true" if the backup cookie is to be used in the deployment, "false" or missing otherwise

ui_featureSwitches_enabled - a comma-delimited list (string list) of feature switches to be enabled in this deployment (e.g. "feature1,feature2")
ui_featureSwitches_disabled - a comma-delimited list of feature switches to be disabled in this deployment (e.g. "feature3,feature4")

ui_coreServices_disabled (optional) - a string list of service module ids which are not utilized in this deployment (obsolete - used to affect service monitoring.)

deploy_services_auth2_path - ??
TODO: There are several other keys not mentioned here - do we still need them??

These are defined in the environment-specific config (ini) file located at our private gitlab instance.

When running a kbase-ui container, the appropriate env vars are loaded from the ini file in the invocation.

These values are used in the dockerize config file transform built into the image.

When running the image there are two basic ways to provide the environment variables:

- as pure environment variables, which will be picked up by docker run, or docker-compose up
  - uses built-in CMD
- directly from an "ini" file
  - dockerize (with steve's addition) can directly utilize an ini file
    - why ini and not env as already supported by docker tools??
    - the motivation was to use ini files from urls to our gitlab
    - but can be used locally too with a file url reference


Rancher in CI has

Image: 

ghcr.io/kbase/kbase-ui:TAG

Command:

```shell
-env https://gitlab.kbase.us/devops/kbase_ui_config/raw/develop/ci_config.ini -env-header /run/secrets/auth_data -validate-cert=false -template /kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf -template /kb/deployment/templates/config.json.tmpl:/kb/deployment/services/kbase-ui/dist/modules/deploy/config.json bash -x /kb/deployment/scripts/start-server.bash
```

Locally we cannot do this, or can we?:


docker run kbase/kbase-ui:dev \
  -env https://gitlab.kbase.us/devops/kbase_ui_config/raw/develop/ci_config.ini \
  -env-header /run/secrets/auth_data \
  -validate-cert=false \
  -template /kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf \
  -template /kb/deployment/templates/config.json.tmpl:/kb/deployment/services/kbase-ui/dist/modules/deploy/config.json \
  bash -x /kb/deployment/scripts/start-server.bash





For local development, docker compose is used to launch the web app server in coordination with a proxy which allows running on the same hostname (e.g. ci.kbase.us) as KBase deployments.

Local development involves additional steps:

- process local development options to extend the base `docker-compose.yml`:
    - `scripts/shell/build-docker-compose-override.sh`

The overall cli command is:

```bash
ENV=ci make start build-image=t
```

and variations.

TODO:

- we need to run the development server inside the container!


For a deploy, the above process is run within a GitHub Actions script, and adds the following:

- start the ui server and run integration tests
- push the build image up to GHCR.


## Plugins

Now to explain plugins again.

The new CRA-TS kbase-ui build still supports plugins.

The essence of a kbase-plugin is a SPA web app which adheres to a simple Post-Message based api and protocol.

Post-Message is a simple message-based communication mechanism built into all modern web browsers. It allows messages (static Javascript data) to be sent and received by any Javascript code in any window currently running in the browser.

It implements some basic security measures to help prevent scripts from targeting unrelated windows. In addition to this, we implement our own measures which make the messaging both more secure and programmatically safer.

To facilitate this, kbase-ui and plugins use a library class named WindowChannel. The WindowChannel allows messages to be sent and received between a pair of windows. Each window needs to have a complementary WindowChannel instance in order to exchange messages. We call the instance a "channel".

A key concept of channels is the "channel id". A channel id is a uuid assigned to each unique channel. By only accepting messages targeting its id, that id begin essentially impossible to guess (via uuid characteristics), and by carefully providing this channel id to the partner channel, we can establish a relatively safe and secure relationship between two windows.

The basic plugin loading protocol:

kbase-ui (host) establishes a channel.
host creates an iframe with the host channel id embedded in it
the iframe also has a second uuid, the plugin channel id, embedded
the iframe loads the plugin web app
the plugin creates its own channel using the id embedded in the iframe
the plugin sends a 'ready' message to the host
the host sends the 'start' message to the plugin, with essential information including configuration, authentication, and navigation.
the plugin validates and accepts this information, and sends a 'started' message
the plugin loads the requested view
the plugin sends a 'set-title' message to cause the host (kbase-ui) to display the provided text in the page header and browser title.

at this point, the plugin is running.

there are a handful of other protocols:

navigation for the plugin

navigation for the host

navigation with authentication for the host

authentication change for the plugin

logged out for the plugin

logged in for the plugin






# ITERATING

in one terminal: 

cd react-app
npm run start


in another:

tools/proxy-standalone
ENV=ci docker compose up


# Build image


## Development workflow in container:

### Start

Build image:

```bash
docker build -f tools/run-dev/Dockerfile -t kbase-ui-dev:dev .    
```


```bash
docker run -it --hostname=kbase-ui --entrypoint=sh --network=kbase-dev -p 3000:3000 -e CHOKIDAR_USEPOLLING=true  -v `pwd`/react-app/src:/kb/deployment/app/src -v `pwd`/build/dist/modules/plugins:/kb/deployment/app/modules/plugins  kbase-ui-dev:dev
```

Then sh into container:

currently cheese out and use Docker Desktop

then, in container shell:

cd deployment/app
npm install
npm run start


### Proxy

cd tools/proxy-standalone
ENV=ci docker compose up