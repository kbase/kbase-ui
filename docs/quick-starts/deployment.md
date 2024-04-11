# `kbase-ui` Deployment Quick Start

## Changes

`kbase-ui` now runs in a hosted environment of `Europa`, rather than as a
standalone web app. However, it is still deployed as it has been for years - as
a web app hosted by it's own nginx server.

With this change, we have also migrated from "ini file" environment variables,
to direct usage of environment variables.

## Image

A production deployment image is tagged with the release semver 2.0 version. E.g.
`ghcr.io/kbase/kbase-ui:v1.2.3`.

Evaluation of pull requests in CI or some other environment can be achieved with
images built from  pull request activity, which have the form
`ghcr.io/kbase/kbase-ui:pr-123`. Such images are often deployed in CI.

## Docker Command

The image entrypoint is `dockerize`, so the image's `command` is overridden to
supply command line arguments to dockerize.

`dockerize` generates configuration files from environment variables supplied by the
deployment service.

> Note that in the previous deployment practice, the configuration environment variables
> were stored in a "ini" file in our private gitlab.

This is the command for CI Rancher:

```shell
-template /kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf -template /kb/deployment/templates/config.json.tmpl:/kb/deployment/app/deploy/config.json bash -x /kb/deployment/scripts/start-server.bash
```

> NOTE: kbase-ui uses `powerman/dockerize`, the successor to the original
> `jwilder/dockerize`, and not the (unmaintained) KBase fork of `jwilder/dockerize`.
> Some command line options are a bit different, as well as some of the custom
> templating commands.

## Environment Variables

As mentioned above, runtime parameterization is by means of environment
variables.

See [docs/deployment/configuration.md](docs/deployment/configuration.md) for details.

## Verifying deployment

After a deployment, you may visit `https://[env.]kbase.us#about` to confirm that
the expected version has been installed.
