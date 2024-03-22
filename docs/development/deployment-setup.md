# Deployment Setup

## Local Deployment Setup

For local deployment, kbase-ui is operated just as in a real deployment - from a built
app, in a container built from the main Dockerfile, using dockerize to process the
kbase-ui and nginx config files using environment variables.

### Generate configs

This is the same procedure as for development, as some of the same files are utliized.

- For local usage of a kbase-ui deployment, we still need to use the proxy in order to
  operate on a deployment domain, and to use local services and Narrative.

  ```shell
  SERVICE_PROXIES=orcidlink DEPLOY_ENV=ci KBASE_UI_HOSTNAME=legacy ./Taskfile generate-proxy-env
  ```

- For kbase-ui

  For the deployed kbase-ui, we don't need to use the config.json file, as it is built
  "on the fly" by the container via the dockerize entrypoint. However, we do utilize
  the env file that is generated along with config.json, so we use the subtask
  "generate-runtime-env" to create this env file.

  ```shell
  DEPLOY_ENV=ci KBASE_UI_HOSTNAME=legacy ./Taskfile generate-runtime-env
  ```

### Build kbase-ui

The kbase-ui build is automated via a Taskfile task `build-kbase-ui`. This task will
generate build and git info files, download and setup plugins, build the web app, and
assemble all of this into a docker image.

```shell
BASE_PATH="" GH_TOKEN="PAT_HERE" ./Taskfile build-kbase-ui
```

The `BASE_PATH` is optional. It is only required if there is a base path. It is utilized
in the `vite` build to construct the root `index.html` file. `kbase-ui` itself doesn't
use this value, rather it will use the value provided in the configuration. So, yes,
this must match the configuration.

The `GH_TOKEN` is used for a local build, because GitHub rate limits unauthenticated
access to github.com. With a GH_TOKEN set to a Personal Access Token (PAT), rate
limiting is much higher (I've never run into rate limiting when using a PAT).

Not that the GH_TOKEN is not required in a build through Github Actions.

### Run kbase-ui

Once the image is successfully built, starting the local server is as simple as:

```shell
./Taskfile start-local-server
```

Note that this is so simply because an env file is used to supply the runtime
environment variables. This env file is located at `.devcontainer/runtime.env`.

If you get a message like:

```shell
Error response from daemon: Conflict. The container name "/kbase-ui" is already in use by container "56b79f26b53079d32e03a45110affe8150a748ac8d63e792274fdf9bdb172fd9". You have to remove (or rename) that container to be able to reuse that name.
```

you may already have a development container for kbase-ui. After exiting a VSC
devcontainer, the containers are not removed.
