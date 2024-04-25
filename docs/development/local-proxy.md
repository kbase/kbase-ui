# KBase UI Proxy

kbase-ui ships with an nginx-based proxy server, with support for proxying to
kbase-ui, Europa, Narrative, core services, and dynamic services to local
instances. If you don't specify a local instance to proxy to, the proxy will
contact the deployed instance.

The proxy is used to set up a local configuration that mimics a deployment. This
is very useful for normal development workflows, multi-project workflows, as
well as to evaluate deployment configurations.

This is all discussed in [Development Scenarios](./development-scenarios.md).

For now, we are going to focus on just the proxy itself.

## Quick Starts

Here is how to start the proxy to run against CI, proxying to a local instance
of kbase-ui (see below):

1. __Configure__ it

  ```shell
  DEPLOY_ENV=ci KBASE_UI_HOST=kbase-ui KBASE_UI_PORT=80 KBASE_UI_HOSTNAME=legacy ./Taskfile generate-proxy-env`
  ```

2. Map environment __domain__ to it

    Add `127.0.0.1 ci.kbase.us legacy.ci.kbase.us legacy2.ci.kbase.us` to
  `/etc/hosts`

3. Start it

  `./Taskfile run-proxy`

### Configuration

The proxy server needs a configuration before it will run at all. A
configuration may be easily built using a task script.

Here is how to build the proxy configuration for running kbase-ui locally in the
devcontainer in the ci deployment environment.

```shell
DEPLOY_ENV=ci KBASE_UI_HOST=kbase-ui KBASE_UI_PORT=3000 KBASE_UI_HOSTNAME=legacy ./Taskfile generate-proxy-env
```

The configuration is written as an "env file" to `.devcontainer/proxy.env`. This
same file will serve both usages of the proxy, as described below.

### Mapping environment domain

In order for the proxy to respond to urls of the form
`https://ci.kbase.us#about`, that is using the a KBase deployment environment
domain, you'll need to update your local "hosts" file.

Edit `/etc/hosts`

Add the line:

```text
127.0.0.1 ci.kbase.us legacy.ci.kbase.us
```

### Starting

#### Using the proxy in the devcontainer

Most of the time, a developer will use the proxy through the VSC devcontainer.
The devcontainer has a docker compose configuration which starts up the
development container, a proxy container, and a deploy asset container.

To start the devcontainer:

- Prepare the kbase-ui config:
  `DEPLOY_ENV=ci  KBASE_UI_HOSTNAME=legacy ./Taskfile generate-runtime-config`
- Open the kbase-ui repo in Visual Studio Code
- `[Shift][Command]P`
- search for "open in container"
- select "Dev Containers: Reopen in Container"
- the three container images should be built, if necessary, and launch.
- you'll be dropped into a shell inside the image; if not, open a VSC terminal
  and you will be.
- start kbase-ui:

  ```shell
  cd vite-app
  npm run dev
  ```

> A handy tip if you are a Docker Desktop user, is to open the Docker Desktop
> Dashboard to check that everything started up correctly. Forgetting to build
> the config, or making a mistake in it, can cause the proxy to fail.

#### Using the proxy standalone

When running a kbase-ui server outside of the devcontainer, you'll need to spin
up the standalone proxy service.

- get kbase-ui going:
    - sure, you can use the proxy without kbase-ui, but what is the point?
    - Prepare the kbase-ui config:
    `DEPLOY_ENV=ci  KBASE_UI_HOSTNAME=legacy ./Taskfile generate-runtime-config`
    - start kbase-ui in [standalone configuration](./local-deployment.md)
    `./Taskfile run-server`
- configure the proxy:
  `DEPLOY_ENV=ci KBASE_UI_HOST=kbase-ui KBASE_UI_PORT=80 KBASE_UI_HOSTNAME=legacy ./Taskfile generate-proxy-env`
  > note that here we use port `80`, since we are using the local deployment
- run the proxy
  `./Taskfile run-proxy`

## About the Proxy

The proxy is implemented as a lightweight nginx container with a configuration
crafted according to the configuration provided.

It is implemented in `tools/proxy`.

## Recipes

- proxy to local kbase-ui
    - development server
    - "production" server
- proxy to local Europa
    - development server
    - "production" server
- proxy to a local Narrative
    - just the usual server
- proxy to local core service
- proxy to local dynamic service
