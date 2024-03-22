# Environment Variables in kbase-ui

`kbase-ui` relies upon a set of required and optional environment
variables. It depends upon them in a manner quite characteristic of KBase services, that
is, indirectly by using them to create a configuration file.

This makes sense, as `kbase-ui`, though at its heart a single page web app,
statically compiled, and simply loaded into the browser, is deployed and
operated like any service.

This is due to the fact that it is deployed with its own nginx server, whose sole job is
to serve up the kbase-ui assets to a browser. This nginx server runs in a
container. This container uses `dockerize` as its entry point

`kbase-ui` uses `dockerize` to generate two files: `nginx.conf` for the `nginx`
server, and `config.json`, for `kbase-ui`.

The `nginx` configuration is primarily used to control nginx logging. 

It can also host kbase-ui assets on a path prefix, but this is not utilized at
present. The path for kbase-ui assets within the nginx server is the root path -
`"/"` or `""`.

The `kbase-ui` configuration is more extensive. It is used to supply:

- the base path (unused),
- hostnames for the top level user interface (Europa, Narrative) and services.
- special auth behavior for prod (backup cookie)
- feature switches

## Catalog of Environment Variables

Environment variables are divided into those supporting the kbase-ui web app, and those
supporting the nginx server. In addition, these are divided into required environment
variables without defaults and those with defaults, which can be considered optional.

The fulls set of environment variables, therefore, is the intersection. 

The full set of required environment variables is:

- `KBASE_ENDPOINT`
- `UI_HOSTNAME`

The full set of optional environment variables is:

- `BASE_PATH`
- `DEFAULT_PATH`
- `DEFAULT_PATH_TYPE`
- `FEATURE_SWITCHES_ENABLED`
- `FEATURE_SWITCHES_DISABLED`
- `AUTH2_PROVIDERS`
- `NGINX_LOG_SYSLOG`
- `NGINX_LOG_STDOUT`
- `NGINX_LOG_STDERR`
- `NGINX_LOG_LEVEL`
- `NGINX_LISTEN`
- `NGINX_SERVER_NAME`

### Web App

These environment variables are applied to `deploy/templates/config.json.tmpl`.

#### Required (no defaults)

| Name           | Description                                                                               |
|----------------|-------------------------------------------------------------------------------------------|
| KBASE_ENDPOINT | The traditional KBase services url base; e.g. `https://ci.kbase.us/services/`             |
| UI_HOSTNAME    | The hostname at which Europa, and most KBase user interfaces, operate in this environment |

#### Optional (with defaults)

| Name                      | Default               | Description                                                                               |
|---------------------------|-----------------------|-------------------------------------------------------------------------------------------|
| BASE_PATH                 | "/"                   | The base, or prefix, path kbase-ui should expect; currently unused (but had been planned) |
| DEFAULT_PATH              | "narratives"          | When kbase-ui is asked to show the dashboard, go here [1]                                 |
| DEFAULT_PATH_TYPE         | "europui"             | The type of path for the above - either "europaui" or "kbaseui"                           |
| FEATURE_SWITCHES_ENABLED  | ""                    |                                                                                           |
| FEATURE_SWITCHES_DISABLED | ""                    |                                                                                           |
| AUTH2_PROVIDERS           | "Google,Globus,OrcID" |                                                                                           |



### Nginx Server

These environment variables are applied to `deploy/templates/nginx.conf.tmpl`.

#### Required (no defaults)

| Name           | Description                                                                   |
|----------------|-------------------------------------------------------------------------------|
| KBASE_ENDPOINT | The traditional KBase services url base; e.g. `https://ci.kbase.us/services/` |
| UI_HOSTNAME    | The hostname at which Europa and Narrative operate                            |


#### Optional (with defaults)

| Name              | Default | Description                                                                                                                 |
|-------------------|---------|-----------------------------------------------------------------------------------------------------------------------------|
| NGINX_LOG_SYSLOG  | ""      | If provided, sets an `access_log NGINX_LOG_SYSLOG combined;` stanza, where the value is a valid syslog configuration string |
| NGINX_LOG_STDOUT  | "true"  | if "true", `access_log /dev/stdout;`                                                                                        |
| NGINX_LOG_STDERR  | "true"  | if "true", `access_log /dev/stderr;`                                                                                        |
| NGINX_LOG_LEVEL   | "error" | adds given log level to stderr (if enabled) and `/var/log/nginx/error.log`                                                  |
| NGINX_LISTEN      | "80"    | The port on which to listen for requests                                                                                    |
| NGINX_SERVER_NAME | "true"  | The host name on which to listen for requests.                                                                              |

## Usage in Development

During development, these environment variables are used to generate the configuration
files manually. This is because local development does not typically use the nginx
server in the deployment container, but rather runs the web app in development mode in a
Visual Studio Code devcontainer.

To generate the configuration files:

1. Set the environment variables:

    - for ci:

    ```shell
    export KBASE_ENDPOINT=https://ci.kbase.us/services/
    export UI_HOSTNAME=ci.kbase.us
    export FEATURE_SWITCHES_ENABLED=search_features,similar_genomes,re-lineage,linked-samples,sampleset-data-links,object-link-to-term
    ```

    For local usage:

    ```shell
    NGINX_LOG_SYSLOG=
    ```

    For the real deployment:

    ```shell
    NGINX_LOG_SYSLOG=syslog:server=10.58.0.54,facility=local2,tag=ci,severity=info
    ```

    - for appdev:

    ```shell
    export KBASE_ENDPOINT=https://appdev.kbase.us/services/
    export UI_HOSTNAME=appdev.kbase.us
    export FEATURE_SWITCHES_ENABLED=similar_genomes
    ```

    For local usage:

    ```shell
    NGINX_LOG_SYSLOG=
    ```

    For the real deployment:

    ```shell
    NGINX_LOG_SYSLOG=syslog:server=10.58.0.54,facility=local2,tag=appdev,severity=info
    ```

    - for next:

    ```shell
    export KBASE_ENDPOINT=https://next.kbase.us/services/
    export UI_HOSTNAME=next.kbase.us
    export FEATURE_SWITCHES_ENABLED=similar_genomes
    ```

    For local usage:

    ```shell
    NGINX_LOG_SYSLOG=
    ```

    For the real deployment:

    ```shell
    NGINX_LOG_SYSLOG=syslog:server=10.58.0.54,facility=local2,tag=next,severity=info
    ```

    - for prod:

    ```shell
    export KBASE_ENDPOINT=https://kbase.us/services/
    export UI_HOSTNAME=narrative.kbase.us
    export FEATURE_SWITCHES_ENABLED=similar_genomes
    ```

    For local usage:

    ```shell
    NGINX_LOG_SYSLOG=
    ```

    For the real deployment:

    ```shell
    NGINX_LOG_SYSLOG=syslog:server=10.58.0.54,facility=local2,tag=prod,severity=info
    ```

2. Generate the configs

    ```shell
    ./Taskfile render-templates
    ```

## Usage in Deployments