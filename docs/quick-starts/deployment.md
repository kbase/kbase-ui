# `kbase-ui` Deployment Quick Start

## Notable changes of interest for deployment

`kbase-ui` now runs only in a hosted environment of `Europa`, rather than as a
standalone web app. However, it is still deployed as it has been for years - as
a web app hosted by it's own nginx server.

We have also migrated from "ini file" environment variables, to direct usage of
environment variables.

## Image

Images are created from GHA workflows.

Images are tagged in various ways.

The canonical image for deployment is a release image. A release image is
created from, well, a GitHub Release. a release receives a tag in the form
`v#.#.#` in semver 2.0 format. For example, for release "1.2.3" the image would
be `ghcr.io/kbase/kbase-ui:v1.2.3`.

Images are also created for pull requests. It is not uncommon to deploy from
pull requests in CI, or perhaps narrative-dev, in order to evaluate upcoming changes.
Images built from pull request activity, have the form
`ghcr.io/kbase/kbase-ui:pr-123`.

Occasionally an image will be manually built. In such cases it will be tagged
with the branch name, prefixed with "br-". For example, a manual build from
branch "foo" would be named `ghcr.io/kbase/kbase-ui:br-foo`.

## Docker Command

The image entrypoint is `dockerize`, with the command set to the arguments for
dockerize. The arguments are responsible for rendering two templates, the
primary configuration file for kbase-ui, and the nginx server configuration.
Ultimately, the command also starts the nginx server.

The command built into the image is adequate for any normal deployment, and does
not need to be specified in the deployment service (e.g. Rancher.)

The `dockerize` template rendering consumes ordinary environment variables supplied by
the deployment service.

> In the previous deployment practice, the configuration environment variables
> were stored in a "ini" file in our private gitlab.

**Note:** kbase-ui uses
[`powerman/dockerize`](https://github.com/powerman/dockerize), the successor to
the original `jwilder/dockerize`. It previously used a KBase fork of
`jwilder/dockerize`. Some command line options have changed, some templating
commads have a different syntax (notably "default"), and new templating commands
have been added.

## Environment Variables

As mentioned above, runtime parameterization is by means of environment
variables.

The only required environment variables is:

- KBASE_DOMAIN

Although it is recommended to also set

- NGINX_SYSLOG

because, although not required for kbase-ui to operate, it has traditionally
been set, and does vary between deployments enough that it cannot have a
default value.

There are many more environment variables to control kbase-ui, but they have
sensible defaults that normally do not vary between deployments and, some cases,
have remained the same for many years.

See [docs/environment-variables.md](../environment-variables.md) for a description
of all environment variables.

See [docs/deployment/configuration.md](../deployment/configuration.md) for
details.

Here are the variables that should be used per environment at the time of writing:

### ci

| Variable          | Value                                                           |
|-------------------|-----------------------------------------------------------------|
| `KBASE_DOMAIN`    | `ci.kbase.us`                                                   |
| `NGINX_SYSLOG`    | `syslog:server=10.58.0.54,facility=local2,tag=ci,severity=info` |

### ci-europa

| Variable          | Value                                                                  |
|-------------------|------------------------------------------------------------------------|
| `KBASE_DOMAIN`    | `ci-europa.kbase.us`                                                   |
| `NGINX_SYSLOG`    | `syslog:server=10.58.0.54,facility=local2,tag=ci-europa,severity=info` |

### next

| Variable          | Value                                                             |
|-------------------|-------------------------------------------------------------------|
| `KBASE_DOMAIN`    | `next.kbase.us`                                                   |
| `NGINX_SYSLOG`    | `syslog:server=10.58.0.54,facility=local2,tag=next,severity=info` |

### narrative-dev

| Variable          | Value                                                                      |
|-------------------|----------------------------------------------------------------------------|
| `KBASE_DOMAIN`    | `narrative-dev.kbase.us`                                                   |
| `NGINX_SYSLOG`    | `syslog:server=10.58.0.54,facility=local2,tag=narrative-dev,severity=info` |

### appdev

| Variable          | Value                                                               |
|-------------------|---------------------------------------------------------------------|
| `KBASE_DOMAIN`    | `appdev.kbase.us`                                                   |
| `NGINX_SYSLOG`    | `syslog:server=10.58.0.54,facility=local2,tag=appdev,severity=info` |

### narrative (production)

| Variable          | Value                                                             |
|-------------------|-------------------------------------------------------------------|
| `KBASE_DOMAIN`    | `narrative.kbase.us`                                              |
| `NGINX_SYSLOG`    | `syslog:server=10.58.0.54,facility=local2,tag=prod,severity=info` |

## Verifying deployment

After a deployment, you can visit `https://[ENV].kbase.us#about/build` to
confirm that the expected version has been installed.

Other related strategies are:

- Run [integration](../development//integration-tests.md) tests against the deployment
- Before the deployment use the image locally to evaluate expected changes
- Run integration tests against a local deployment of the deploy image

## Related Topics

- [creating and using a local build](../development//local-deployment.md)
- using a GHCR image locally to verify it
- [environment variables](../environment-variables.md)
- [configuration design](../design//configuration.md)
