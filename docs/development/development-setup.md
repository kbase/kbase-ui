# `kbase-ui` Development Setup

`kbase-ui` was designed to run against arbitrary deployment environments,
limited only by available configuration files. Traditionally, `kbase-ui` used
configuration environment files stored in KBase's gitlab. This approach served
well over the years, but suffered a few problems (described elsewhere.) The
current build uses environment variables instead.

In both cases, kbase-ui configuration is made available to the runtime via a
json config file which is generated from a template, using environment
variables, during service startup. The config file is generated before the
entrypoint is run, with `dockerize`.

During development, kbase-ui is run inside a devcontainer. Therefore, the
entrypoint configuration process is not run. Instead, before starting the
devcontainer, the developer sets the required environment variables, and builds
the config file with a script (`Taskfile render-templates`).

So the steps are:

- Generate env variables:

    - For the proxy:

    ```shell
   DEPLOY_ENV=ci KBASE_UI_HOSTNAME=legacy ./Taskfile generate-proxy-env
    ```

    - For kbase-ui

    The kbase-ui development runtime (run via a _vite_ development server) does
    not need any environment variables to control its behavior. Rather, all app
    parameterization can be found in `config.json`. This file is normally built
    by the container's entrypoint, based on environment variables, but for
    development this file must be built first:

    ```shell
    DEPLOY_ENV=ci KBASE_UI_HOSTNAME=legacy ./Taskfile generate-runtime-config
    ```

- start the devcontainer

- launch kbase-ui:

  ```shell
  cd vite-app
  npm run dev
  ```

## What Happens

### Proxy Environment Variables

The `generate-proxy-env` task creates an "env" file in `.devcontainer/proxy.env`. This
env file is used by the "kbase-ui-proxy" service in the devcontainer's docker-compose
configuration.

Below is an mexample env file generated from the command using minimal environment
variables. This configuration is suitable for running under Europa, with all services
proxied to the CI environment:

```shell
DEPLOY_ENV=ci KBASE_UI_HOSTNAME=legacy ./Taskfile generate-proxy-env
```

which produces the following env:

```shell
# An env file for usage by the proxy service in the devcontainer.
KBASE_UI_HOST="kbase-ui"
EUROPA_UI_HOST="europa-ui"
BASE_PATH=""
UI_DOMAIN="ci.kbase.us"
KBASE_UI_DOMAIN="legacy.ci.kbase.us"
SERVICES_HOSTNAME="ci.kbase.us"
LOCAL_NARRATIVE=""
SERVICE_PROXIES=""
DYNAMIC_SERVICE_PROXIES=""
```

To support working with a local instance of the Narrative and a local instance of the
orcidlink service we can use this command line

```shell
LOCAL_NARRATIVE=t SERVICE_PROXIES=orcidlink DEPLOY_ENV=ci KBASE_UI_HOSTNAME=legacy ./Taskfile generate-proxy-env
```

which produces the following env:

```shell
# An env file for usage by the proxy service in the devcontainer.
KBASE_UI_HOST="kbase-ui"
EUROPA_UI_HOST="europa-ui"
BASE_PATH=""
UI_DOMAIN="ci.kbase.us"
KBASE_UI_DOMAIN="legacy.ci.kbase.us"
SERVICES_HOSTNAME="ci.kbase.us"
LOCAL_NARRATIVE="t"
SERVICE_PROXIES="orcidlink"
DYNAMIC_SERVICE_PROXIES=""
```

### Runtime Config Environment Variables

`kbase-ui` traditionally relies upon a pair of configuration files, `deploy/config.json`
and `/etc/nginx/nginx.conf`, to determine configurable runtime behavior. In a deployment,
this file is generated by `dockerize` from environment variables supplied by an env file
served out of a private gitlab.

The new incarnation of kbase-ui still utilizes this basic framework, but relies upon
environment variables set by the deployment platform rather than an env file out of
gitlab.

The development support tools allow us to generate these environment variables from a
script. The script is essentialy an environment helper, as it contains logic specific to
different development environments. In a deploy environment, these environment variables
must be specified in the deployment tool (e.g. rancher.)

To generate the runtine configuration environment variables, we just need to specify the
deploy environment tag and specify how it is to be run under Europa with either
`BASE_PATH` or `KBASE_UI_HOSTNAME`:

```shell
DEPLOY_ENV=ci KBASE_UI_HOSTNAME=legacy ./Taskfile generate-runtime-env
```

> TODO: update to note that we don't need the pre-built config.json for this

This generates two files, an env file, and the JSON config file built by dockerize with
this env file.

The env file is located in `.devcontainer/runtime.env` and looks like this:

```shell
BASE_PATH=""
DEFAULT_PATH="narratives"
DEFAULT_PATH_TYPE="europaui"
UI_DOMAIN="ci.kbase.us"
KBASE_UI_DOMAIN="legacy.ci.kbase.us"
FEATURE_SWITCHES_ENABLED="search_features,similar_genomes,re-lineage,linked-samples,sampleset-data-links,object-link-to-term"
FEATURE_SWITCHES_DISABLED=""
AUTH2_PROVIDERS="Google,Globus,OrcID"
KBASE_ENDPOINT="https://ci.kbase.us/services/"
NGINX_LOG_SYSLOG=""
NGINX_LOG_STDOUT="true"
NGINX_LOG_STDERR="true"
NGINX_LOG_LEVEL="error"
NGINX_LISTEN="80"
NGINX_SERVER_NAME="localhost"
```

These are the same environment variables that would be used in a deployment. So, in
fact, the "generate-runtime-config" task can be used to generate environment variables
for a deployment server (e.g. Rancher).

The runtime config file is placed in `build/deploy/config.json`, and the nginx file in
`build/deploy/nginx.conf`. The nginx file is not used during development, as it is only
used to control the nginx front end to kbase-ui in KBase deployment environments.

The JSON config file is made available to kbase-ui through the dev server's
proxy and the devcontainer's special "deploy proxy" - a small nginx server whose
job is to proxy assets normally built into the kbase-ui image, or made available
through dockerize-generated files. This includes:

- `build/build-info.json`
- `build/git-info.json`
- `deploy/config.json`
- `plugins`

## Running the development server

To engage in a development session behind the usual kbase-ui development proxies:

- start the devcontainer: on macOS `Shift`-`Command`-`P`, then search for "Dev
  Containers: Reopen in Container", and select it.

- a terminal should open in the devcontainer. The current directory will be the repo.

- change into the vite directory `cd vite-app`

- install npm dependencies `npm ci`

- run the dev server `npm run dev`

## environment variables

Base

```shell
export NGINX_LOG_STDOUT=true
export NGINX_LOG_STDERR=true
export NGINX_LOG_LEVEL=error
export NGINX_LISTEN=80
export NGINX_SERVER_NAME=localhost
export DEFAULT_PATH="#about"
export BACKUP_COOKIE_DOMAIN=
export BACKUP_COOKIE_ENABLED=false
export FEATURE_SWITCHES_ENABLED=
export FEATURE_SWITCHES_DISABLED=
export AUTH2_PROVIDERS=Google,Globus,OrcID

```

For CI running locally:

```shell
export KBASE_ENDPOINT=https://ci.kbase.us/services/
export UI_HOSTNAME=ci.kbase.us
export FEATURE_SWITCHES_ENABLED=search_features,system_alert_notification,new_provenance_widget,similar_genomes,re-lineage,linked-samples,sampleset-data-links,object-link-to-term
```
