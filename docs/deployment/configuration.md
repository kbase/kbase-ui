# Configuration

`kbase-ui` is configured through these features:

- a configuration file template, in go-template format, located in
  `deployment/templates/config.json.tmpl`

- a set of configuration environment variables, one per deployment environment, in
  `.ini` file format, located in the KBase gitlab

- a smaller set of configuration environment variables, set in Rancher (in CI at
  least - whatever the deployment tool is, for that is out of scope for this project).

- finally, a rendered configuration file in JSON format is produced at launch time. This
  is read by the kbase-ui SPA to provide the runtime configuraiton. The file is produced
  from the template source, and the two sources of environment variables, rendered by
  the `dockerize` tool.

The configuration file serves as both a source of parameterization (via configuration
parameter ini files) and also static values required by the system. Another way of
stating this is that it provides static values to kbase-ui, some of which can be
overridden with global parameters provided by `ini` files or environment variables.

## What is configured?

Here is a laundry list:

- UI elements to identify the deployment environment in the interface - required for
  non-prod environments so staff can know which environment they are running in without
  inspecting the URL (before this feature, this was a source of confusion at KBase).

- Base URL for services and front ends

- root directory w/in the container

- constants for various kbase-ui features, such as the polling intervals for feeds, auth
  cookie changes, auth token validation checks, service call timeout.

- urls to common documentation and other endpoints 

- feature switches to enable or disable specific features, usually under development but
  not necessarily

- default path

- redirect of #dashboard

- services endpoint url and metadata (service type, label, etc.)

- dynamic service version pinning

A separate file, `vite-app/src/components/menus/menu.json` provides the menu
definitions, and is loaded at runtime.

The plugins file, `config/plugins.yml`, is used at built time to provide instructions
for fetching and installing plugins.

Several files area generated at built-time to provided metadata, primarily for display:

- `plugin-manifest.json` which ends up in the `plugins` directory
- `build-info.json` which contains build statistics, located in the `deploy` directory
- `git-info.json` which contains information about the cloned git repo for the build,
  also located in the `deploy` directory
  
## History

When first converted to a service format, in which it is run behind an nginx proxy and
"deployed" as any other service, it was modified to support a new, arising standard for
configuration at KBase. (I don't think that standard was every fully rolled out, except
for kbase-ui!)

In this standard, there is a single configuration template, a single source of
parameterization via environment variables embedded in an .ini file, and a single output
configuration file that can be read by the service. Each KBase deployment environment
has its own parameterization source. The latter feature is what enables a service to be
customized per-deployment environment. Typical customization always includes the base url for
services, but for kbase-ui also includes an icon to identify the deployment environment
visually, feature switches, etc.

> It is instructive to note that the previous practice, and one still used in the
> Narrative, was to include ALL configuration directly into the service codebase, with
> an alternative configuration for each environment, and to pass in a single deployment
> environment parameter with a value of "ci", "next", "prod", etc. which would be used
> to select the desired configuration. However, it was felt that the codebase itself
> should have no awareness of environments, but would be handed a configuration upon
> startup. The scheme described here approximates that approach, as the deployment
> mechanism takes care of selecting the environment file; yet local development needs to
> be aware of this mechanism, so there is knowledge of environments within the codebase
> repo, even if not in the runtime code itself.

A key feature is that the template is in go-template format and is processed by
`jwilder/dockerize`, which was a popular tool to serve as an entrypoint for services
running in a docker container. `dockerize` can handle several tasks to serve this
purpose. We used its template rendering feature, which provides some additional
functionality beyond the standard go-language template. In fact, KBase even forked this
tool and added a bit more functionality - specifically the ability to utilize
environment files (like the ini files we use) and to fetch them via https.

The `dockerize` did not accept our changes - nor the PRs from others - it was fairly
conservative with such things (and as we'll find out later, KBase has since abandoned
that approach, so perhaps the project was right?). Eventually, however, another
maintainer jumped in and created a fork `powerman/dockerize`, which included all of the
KBase changes, as well as quite a few others. Although not strictly backwards
compatible, kbase-ui now uses this fork, as our fork had become quite out of date with
respect to the upstream project.

This setup served well for many years. The main source of trouble for it was that
placing the ini files in gitlab was awkward. It was set up so that the master branch was
used for the production, appdev, and next environments, and the develop branch for CI
and narrative-dev. The develop branch was accessible to kbase-ui developers, so could be
crafted to support new configuration parameters, which would then be merged into the
master branch after verified.

However, at some point early on the changes from the develop branch stopped being
merged. I don't know why this was, but have thought it was due to two factors - (1) it
was a unique configuration setup which was intended to become common and standardized,
but never was, and (2) the person in charge of it (and who had created the forked
`dockerman`) left KBase and no-one knew how it was designed to work nor had been
assigned to manage it.

In recent months, perhaps the last couple years (it is 2023), there has been a change of
heart. The preference is now that services be configured purely from environment
variables set directly in the deployment tool. E.g. in CI services are managed with
Rancher, which offers the ability to set environment variables. This approach offers
some advantages over file-based configuration:

- it removes the need for a repository of configuration values, a source of confusion
  and opacity
- it is easier to modify in an environment (via Rancher, e.g.)
- it is easier to work with in development

## Current kbase-ui

Currently, the kbase-ui codebase uses a mixture of the two approaches. It relies upon a
set of well-established (a nice way of saying "older" or "legacy") configuration
parameter values which are provided by the gitlab-provided per-environment config files.
At the same time, new configuration parameters are provided as regular environment
variables.

## File-based Configuration

As can be seen below, the file-based configuration parameters are quite numerous. This
is due to features added over time which may require different behavior between
deployment environments.

We'll review them below.

It is notable, however, that this could be seen as an argument for using file-based configuration
parameters! The number of variables to maintain in a deployment tool would be daunting.
(At one time there were even more supported variables - e.g. each service url could be overridden.)

Over time, some environment variables became obsolete, mostly because they were never
used or never actually varied between environments.. Here are some examples:

- per-service urls - abandoned because it is a large number of variables to support, and
  because although the root url for services changes per environment, the paths to
  services have never changed after initial launch
- kbase auth cookie names - have never changed; all codebases I'm aware of hard-code
  this value

```ini
# KBase UI CI Config

deploy_environment=ci
deploy_hostname=ci.kbase.us
deploy_icon=flask
deploy_name=Continuous Integration
deploy_debug=false

nginx_log_syslog=syslog:server=10.58.0.54,facility=local2,tag=ci,severity=info
nginx_log_stdout=true
nginx_log_stderr=true

ui_backupCookie_domain=
ui_backupCookie_enabled=false

ui_services_analytics_google_apiEndpoint=https://www.google-analytics.com/collect
ui_services_analytics_google_hostname=ci.kbase.us
ui_services_analytics_google_code=UA-74532036-1

allow=alpha,beta

services_narrative_url=https://ci.kbase.us
services_auth2_providers=Google,Globus,OrcID
services_auth2_version_minimum=0.2.5

dynamicServices_JobBrowserBFF_version=auto
dynamicServices_SampleService_version=auto
dynamicServices_OntologyAPI_version=dev
dynamicServices_TaxonomyAPI_version=auto

ui_services_menu_hamburger_disabled=
ui_services_menu_sidebar_disabled=

ui_featureSwitches_enabled=search_features,similar_genomes,re-lineage,linked-samples,sampleset-data-links,object-link-to-term
ui_featureSwitches_disabled=

dynamic_service_proxies=

ui_coreServices_disabled=
```

## Environment Variables

The traditional location for configuration parameters is the `.ini` file described
above. However, as this setup is out of favor and not well understood, recent
parameterization is by way of good ol' environment variables.

At present, all environment variables have sensible defaults and may be omitted.

The environment variables listed below are supported.

> Several settings use a "boolean string" for which the string `"true"` indicates boolean`true` and anything else considered false.

| Name | Default | Description |
|------|---------|-------------|
|`DEFAULT_PATH`| `"/narratives"` | A url path or "hash path" to serve as the target internal path if kbase-ui is invoked without a path (root) or the old `#dashboard` path is requested |

### `DEFAULT_PATH`

`kbase-ui` traditionally shows the `#dashbaord` by default - that is, if no other path
was provided in the url. This was hard coded. 

Several years ago the dashboard was replaced by the "Narratives Navigator", or
"Navigator". This is an external url, as the Navigator is a standalone web app. This was
also hard coded.

Hard coding was fine, as no other behavior was desired. Of course, hard coding the
default path meant that a whole edit, commit, PR, release, deploy cycle was required to
change it. But it never changed, so that was fine.

However, in the near future kbase-ui will be run inside an iframe of yet another Kbase
UI. In this case, the current behavior of redirecting to the Navigator is not desired,
as the outer UI will handle that. This environment variable allows us to set that path,
either internal or external. 

The internal path is in the form `#path` where the path
must be prefixed with the `#` url fragment symbol. Any internal path configured within
the app may be used. 

The external path is in the form `/path`, where the path should be prefixed with a `/`
forward slash. This will cause kbase-ui to navigate to the given path on the same
"origin". E.g. if kbase-ui is operating on  `https://ci.kbase.us#about`  the origin is
`https://ci.kbase.us`, and if the default path is set to `/narratives`, the browser will
be redirected to `httpos://ci.kbase.us/narratives`.

The configuration defaults to the current behavior, `/narratives`.
