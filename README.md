# KBase User Interface

## Current Status

| Branch   | Build  || Coverage ||
|----------|--------|---|----------|---|
| master   | ![travis](https://travis-ci.org/kbase/kbase-ui.svg?branch=master) | [details](https://travis-ci.org/kbase/kbase-ui?branch=master) | ![coveralls](https://coveralls.io/repos/kbase/kbase-ui/badge.svg?branch=master) | [details](https://coveralls.io/r/kbase/kbase-ui?branch=master)  |
| develop   | ![travis](https://travis-ci.org/kbase/kbase-ui.svg?branch=develop) | [details](https://travis-ci.org/kbase/kbase-ui?branch=develop) | ![coveralls](https://coveralls.io/repos/kbase/kbase-ui/badge.svg?branch=develop) | [details](https://coveralls.io/r/kbase/kbase-ui?branch=develop)  |

## About

The KBase User Interface (*kbase-ui*) is a web browser Single Page App (SPA) providing tools for [KBase](http://kbase.us) users. It is a partner to the [KBase Narrative Interface](https://github.com/kbase/narrative), with which it shares code yet runs as a separate web app. Current user features include:

- *Dashboard*, for an overview of a user's narratives and activities, and those of their colleagues
- *User Profile*, for viewing any user profile and editing their own, 
- *Data Viewer*, for inspecting any data object a user has access to (aka "landing pages"),
- *Type Viewer*, for inspecting the attributes of any data type,
- *Authenticator*, for logging into and out of user's KBase Account and granting authorization to the web app,
- *Catalog*, for browsing, searching and (for developers) managing KBase Narrative Apps.

> If you have stumbled up on this project, you may first want to [find out about KBase](http://kbase.us). 
> The *KBase UI* is not a general purpose tool -- it is designed to work inside the KBase ecosystem. 

The primary audience for this project is 

- *KBase Developers and Staff* - who need access to the kbase-ui for development, testing, deployment
- *KBase Advanced Users* - who are developing services and plugins for kbase-ui,
- *KBase Contributors* - who wish to know more about the architecture and "sausage making" of KBase.

Most KBase users will be exposed to the KBase UI by ... [using KBase](https://narrative.kbase.us) :)

## Documentation

Documentation is provided either directly from your host machine by building and launching it, or from the fully built kbase-ui.

### From the Repo

This technique relies upon [rawgit](https://rawgit.com) a free service, which expresses caveats, but is in practice quite reliable and fast for our purposes:

- [develop branch](https://rawgit.com/kbase/kbase-ui/develop/docs/book/_book/index.html){target=_blank} - follows changes in development (rate limited)
- [latests release - 1.7.0]() - available after the release

### Local Docs

- ensure you have the following software installed:
    - nodejs 6 or later
    - git
    - make
- clone the repo
    - ```git clone https://gitub.com/kbase/kbase-ui```
- from the repo directory:
    - ```make docs-viewer```
- this will build the documentation and launch your system default browser with the docs.

### From a live kbase-ui



Please see the [documentation](docs/index.md) for additional information on development and deployment.

## Contributing

The KBase UI is an open source project, managed through github. As such, contributions, even internally within KBase, are conducted through fork and PR.

## Release Notes

The current released version is [1.7.0](release-notes/RELEASE_NOTES_1.7.0.md).

## Reporting Bugs

We do not currently use github issues for bug reports. Please send any bug reports, comments, or requests via our [public help board](http://kbase.us/contact).

## License

[LICENSE.md](LICENSE.md)
