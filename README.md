# `kbase-ui` - a KBase User Interface

## About

The KBase User Interface (_kbase-ui_) is a web browser Single Page App (SPA) providing
tools for [KBase](http://www.base.us) users. It is one of several user-facing interfaces
at KBase.

`kbase-ui` has traditionally served as a container for various "plugins" which provide most of the
functionality of the interface. The current set of plugins may be found in [the plugins
config](conig/plugins.yml).

Some examples include:


- _Data Viewer_, for inspecting any data object a user has access to (aka "landing pages"),
- _Type Viewer_, for inspecting the attributes of any data type,
- _Authenticator_, for logging into and out of user's KBase Account and granting authorization to the web app,
- _Catalog_, for browsing, searching and (for developers) managing KBase Narrative Apps.

More recently functionality has been added directly to the `kbase-ui` codebase,
including:

- _User Profile_, for viewing any user profile and editing their own,
- _KBASE ORCID Link_, for creating a link between a KBase account and ORCID account.

## Intended Audience

The primary audience for this project is:

- _KBase Developers and Staff_ - who need access to the kbase-ui for development,
testing, deployment
- _KBase Advanced Users_ - who are developing services and plugins for kbase-ui,
- _KBase Contributors_ - who wish to know more about the architecture and
"sausage making" of KBase.

> If you have stumbled up on this project, you may first want to
> [find out about KBase](http://www.kbase.us). The _KBase UI_ is not a general
> purpose tool -- it is designed to work inside the KBase ecosystem.

## Documentation

Generally, see [the internal documentation](docs/index.md).

Quick starts are a great place to ... start!

- [Deployment](docs/quick-starts//deployment.md)
- [Development](docs/quick-starts/development.md)

## Contributing

The KBase UI is an open source project, managed through GitHub. Generally this is
maintained by [KBase](https://www.kbase.us) staff, through feature or fix branches which
are then incorpporated through a Pull Request process.

## Release Notes

The current released version is [3.x.x](release-notes/RELEASE_NOTES_3.x.x.md).

## Reporting Bugs

We do not currently use GitHub issues for bug reports. Please visit
[KBase Support](http://www.kbase.us/support) for bug reports, questions or
feature requests.

## License

[LICENSE.md](LICENSE.md)
