# `kbase-ui` Deployment Quick Start

## Image

A production deployment image is tagged with the release semver 2.0 version. E.g.
`ghcr.io/kbase/kbase-ui:v1.2.3`.

Evaluation of pull requests in CI or some other environment can be achieved with images
built from  pull request activity, which have the form
`ghcr.io/kbase/kbase-service-orcidlink-develop:pr-123`. Such images are often deployed
in CI.

## Docker Command

The image entrypoint is `dockerize`, so the image's `command` is overridden to supply command
line arguments to dockerize.

`dockerize` generates configuration files from a gitlab `.ini` file
identified in the `-env` option, using the authorization header identified by the
`-env-header` option, and the `-skip-tls-verify` option as the gitlab (at least at one
time) used a self-signed ssl certificate. The other options are the same as in the
kbase-ui `Dockerfile`.

This is the command for CI Rancher:

```shell
-env https://gitlab.kbase.us/devops/kbase_ui_config/raw/develop/ci_config.ini -env-header /run/secrets/auth_data -skip-tls-verify -template /kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf -template /kb/deployment/templates/config.json.tmpl:/kb/deployment/app/deploy/config.json bash -x /kb/deployment/scripts/start-server.bash
```

> NOTE: kbase-ui uses `powermand/dockerize`, the successor to the original
> `jwilder/dockerize`, and not the (unmaintained) KBase fork of `jwilder/dockerize`.
> Some command line options are a bit different, as well as some of the custom
> templating commands.

## Config file data source (ini file)

Configuration for kbase-ui has traditionally been provided by `.ini` environment files
stored in the KBase private gitlab service. These files are fetched over `https`.

There are two sources for gitlab `.ini` files - `develop` and `master` branch. The
develop branch is used for CI, and the master branch for next, appdev, and prod.

Note that these files have not been changed in a long time, and probably never will be
again. KBase now prefers environment variables for service parameterization, and
additional configuration has been made by direct environment variables. At some point in
time, the environment files may be converted to plain environment variables.

See [docs/deployment/configuration.md](docs/deployment/configuration.md) for details.

## Environment Variables

As mentioned above, newer configuration has been moved to environment variables. All
have sensible defaults and can be omitted for normal operation.

See [docs/deployment/configuration.md](docs/deployment/configuration.md) for details.

## Verifying deployment

After a deployment, you may visit `https://[env.]kbase.us#about` to confirm that the
expected version has been installed.
