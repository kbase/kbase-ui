# Generate Runtime Config

Generate an env file 

## Assets

### Tools

- `Taskfile generate-runtime-env`
- `Taskfile generate-runtime-config`
- `scripts/container/generate-runtime-config`

### Outputs

- `.devcontainer/runtime.env`
- `build/deploy/config.json`

## Using

### Environment variables

#### Required

- `DEPLOY_ENV`

#### Optional

- `BASE_PATH`
- `KBASE_UI_HOSTNAME`

#### Output

Created env vars for config.json.tmpl:

- `BASE_PATH`
- `DEFAULT_PATH`
- `DEFAULT_PATH_TYPE`
- `UI_DOMAIN`
- `KBASE_UI_DOMAIN`
- `FEATURE_SWITCHES_ENABLED`
- `FEATURE_SWITCHES_DISABLED`
- `AUTH2_PROVIDERS`
- `KBASE_ENDPOINT`
- `NGINX_LOG_SYSLOG`
- `NGINX_LOG_STDOUT`
- `NGINX_LOG_STDERR`
- `NGINX_LOG_LEVEL`
- `NGINX_LISTEN`
- `NGINX_SERVER_NAME`

### To Generate a build config file

```shell
DEPLOY_ENV=ENV ./Taskfile generate-runtime-config
```

Where:

- `ENV` is a deploy environment tag: ci, ci-europa, next, narrative-dev, appdev, narrative

For example:

```shell
DEPLOY_ENV=ci KBASE_UI_HOSTNAME=legacy ./Taskfile generate-runtime-config
```

Would generate a runtime config file suitable for running against the CI deployment
environment, with kbase-ui hosted on `legacy.ci.kbase.us`.

### TO Generate a build env file

```shell
DEPLOY_ENV=ci ./Taskfile generate-runtime-config
```
