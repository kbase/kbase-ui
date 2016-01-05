# KBase User Interface

## Current Status

<table class="table table-bordered">
    <tr>
        <th width="20%">Branch</th>
        <td width="80%">release (0.1.0)</td>
    </tr>
    <tr>
        <th>Status</th>
        <td>
            <table class="table table-striped">
                <tr>
                    <th width="33%">
                        Build
                    </th>        
                    <td width="33%">
                        <img src="https://travis-ci.org/eapearson/kbase-ui.svg?branch=master">
                    </td>
                    <td width="33%">
                        <a href="https://travis-ci.org/eapearson/kbase-ui">details</a>
                    </td>
                </tr>
                <tr>
                    <th>
                        Coverage
                    </th>
                    <td>
                        <img src="https://coveralls.io/repos/eapearson/kbase-ui/badge.svg?branch=master">
                    </td>
                    <td>
                        <a href="ttps://coveralls.io/r/eapearson/kbase-ui?branch=master">details</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    
</table>

<table class="table table-bordered">
    <tr>
        <th width="20%">Branch</th>
        <td width="80%">master</td>
    </tr>
    <tr>
        <th>Status</th>
        <td>
            <table class="table table-striped">
                <tr>
                    <th width="33%">
                        Build
                    </th>        
                    <td width="33%">
                        <img src="https://travis-ci.org/kbase/kbase-ui.svg?branch=master">
                    </td>
                    <td width="33%">
                        <a href="https://travis-ci.org/kbase/kbase-ui">details</a>
                    </td>
                </tr>
                <tr>
                    <th>
                        Coverage
                    </th>
                    <td>
                        <img src="https://coveralls.io/repos/kbase/kbase-ui/badge.svg?branch=master">
                    </td>
                    <td>
                        <a href="ttps://coveralls.io/r/kbase/kbase-ui?branch=master">details</a>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
    
</table>

## About

The DOE KBase User Interface, or *KBase UI* for short, is a web browser Single Page App (SPA) providing tools for [KBase](http://kbase.us). It is a partner to the KBase Narrative Interface. Current features include:

- *Dashboard*, for an overview of your narratives and activies of your colleages
- *User Profile*, for viewing any user profile and editing your own, 
- *Data Viewer*, for inspecting any data object you have access to 
- *Type Viewer*, for inspecting the attributes of any data type,
- *Authenticator*, for logging into and out of your KBase Account

> If you have stumbled up on this project, you may first want to [find out about KBase](http://kbase.us). 
> The *KBase UI* is not a general purpose tool, but works inside the KBase ecosystem. 

The primary audience for this project is 

- KBase Developers and Staff - who need access to the kbase-ui for development, testing, deployment
- KBase Advanced Users - who are developing servivces and plugins for kbase-ui

Most KBase users will be exposed to the KBase UI by ... [using KBase](https://narrative.kbase.us) :)

## Installation

As a SPA, Kbase UI is "just" a collection of web browser assets. All you need to run it is a modern web browser and a web server. Please read the installation guide for full instructions.

Please see the Installation Guide for all of the details.

However, in the context of a short readme, I hope you can forgive us for jumping to the happy ending version:

```
mkdir myproject
cd myproject
git clone https://github.com/kbase/kbase-ui
cd kbase-ui
make run
```

For more complete instructions (which in turn have links to technical guides), please see:

- [Prerequisites](prerequisites.md)
- [Installation](installation.md)
- [Deployment](deployment.md)

## Development

Please see the [Developer Guide](development.md).

## Contributing

The KBase UI is an open source project, managed through github. As such, contributions, even internally within KBase, are conducted through fork and PR.

## Reporting Bugs

We do not currently use github issues for bug reports. Please send any bug reports, comments, or requests to [help@kbase.us](mailto:help@kbase.us) or use our [contact form](http://kbase.us/contact-us).

## License

[LICENSE.md](license.md)

