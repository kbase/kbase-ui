# KBase User Interface

## Current Status

| Branch   | Build  |   | Coverage |   |
|----------|--------|---|----------|---|
| master   | ![travis](https://travis-ci.org/kbase/kbase-ui.svg?branch=master) | [details](https://travis-ci.org/kbase/kbase-ui) | ![coveralls](https://coveralls.io/repos/kbase/kbase-ui/badge.svg?branch=master) | [details](https://coveralls.io/r/kbase/kbase-ui?branch=master)  |

## About

The KBase User Interface (*kbase-ui*) is a web browser Single Page App (SPA) providing tools for [KBase](http://kbase.us) users. It is a partner to the [KBase Narrative Interface](https://github.com/kbase/narrative), with which it shares code yet runs as a separate web app. Current user features include:

- *Dashboard*, for an overview of a user's narratives and activities, and those of their colleagues
- *User Profile*, for viewing any user profile and editing their own, 
- *Data Viewer*, for inspecting any data object a user has access to (aka "landing pages"),
- *Type Viewer*, for inspecting the attributes of any data type,
- *Authenticator*, for logging into and out of user's KBase Account and granting authorization to the web app.

> If you have stumbled up on this project, you may first want to [find out about KBase](http://kbase.us). 
> The *KBase UI* is not a general purpose tool -- it is designed to work inside the KBase ecosystem. 

The primary audience for this project is 

- *KBase Developers and Staff* - who need access to the kbase-ui for development, testing, deployment
- *KBase ContributorsAdvanced Users* - who are developing servivces and plugins for kbase-ui,
- *KBase Contributors* - who wish to know more about the architecture and "sausage making" of KBase.

Most KBase users will be exposed to the KBase UI by ... [using KBase](https://narrative.kbase.us) :)

## Development

Please see the [documentation](docs/index.md) for additional information on development and deployment.

## Contributing

The KBase UI is an open source project, managed through github. As such, contributions, even internally within KBase, are conducted through fork and PR.

## Release Notes

The current released version is [1.5.0](release-notes/RELEASE_NOTES_1.5.0.md). 

## Reporting Bugs

We do not currently use github issues for bug reports. Please send any bug reports, comments, or requests via our [public help board](http://kbase.us/contact).

## License

[LICENSE.md](LICENSE.md)
