# Prerequisites

The developer setup provides a workflow and set of tools to help develop _kbase-ui_, kbase-ui plugins, and libraries. The basic workflow consists of javascript development on your host (main desktop) environment, a Docker image for running kbase-ui behind nginx, and a separate Docker image for running a proxy for the  kbase-ui container as well as KBase services.

[TOC]

## Basic Development Requirements

You will need to ensure that you have a basic set of development tools on your host desktop machine. These tools are available on Mac, Linux, and Windows.

| app | version | notes |
|-----|---------|------ |
| nodejs | 6 (LTS) | The V8 javascript system, required for building kbase-ui and running tests; we are currently on version 8. |
| npm | 6 | |
| git    | * | the source revision management tool with integration into github |
| docker | * | the linux container manager you will use to run kbase-ui |
| make  | * | all build tasks go through make |

> \* we haven't documented any substantial differences between these tools regarding the kbase-ui development process. However, it is best to keep them always at the most recent version by updating your tool stack periodically

_kbase-ui_ is built not just on your local development workstation, but int the following places:

- in Travis CI, as part of the github workflow
- in the KBase Jenkins instance, as part of the CI deployment
- in a KBase VM (??) as part of the next/appdev/production deployment process

As such, we need to ensure that each part of the build toolchain is consistent in each environment. Thus, even though a different version of the above tools may work for you (and of course no-one is watching you to make sure you aren't!) please be advised that it is possible that you can introduce dependencies upon a version of a tool which will break in one of the other KBase build environments.

### nodejs

Node and npm are used together to build _kbase-ui_ and to run tests. Node and npm change _very_ frequently, and the number of transitive dependencies involved in the build and test toolchain number in the _thousands_. Therefore, we must always be cautious when making changes to both the toolchain and dependencies. On the other hand, they are only used for building and testing _kbase-ui_, and not the runtime operation.

### git

[ to be done ]

### docker 

[ to be done ]

### make

[ to be done]

## Basic Development Requirements

### Overview

_kbase-ui_ should build and run on any modern system: Mac OS X, Linux, Windows.

Procedures for installation of system level packages depends on the system you use, and your toolchain preferences. In this document we provide instructions for installation on platforms in use at KBase using methods that we have employed and work.

## Installation

### All environments

The following tools are available on all supported platforms (Mac, Windows, Linux). Please consult the installation instructions at the respective web sites:

- Docker - [https://www.docker.com](https://www.docker.com)

That leaves us with nodejs and git to install through other means.

### Macintosh

There are three common sources for these tools natively on a Mac:

- Apple xCode
- Native Mac installation packages
- Macports
- Homebrew

(see the Linux section for Vagrant on Mac instructions.)

The requisite development tools are available as regular Mac packages. This is may be the easiest way to get started. However, if you are going to be installing other Unixy tools, or have one of the following package managers installed, either Macports or Homebrew may be preferable, and are not much more difficult. Package managers also make updating your tools easy, whereas the downloadable packages will need to be periodically updated manually.

#### Apple xCode

xCode may be installed from the Apple App Store for free, and is highly recommended for any developer workstation. Not only does it provide some of the required tools, but some macOS developer tools require xCode be installed.

xCode includes both git and make, which are required for building kbase-ui, as well as a compilers which may be required to install other developer tools via installers from macports, npm, and the like.

Although xCode includes git, make and other developer tools, you may also opt to install these or similar (e.g. gmake) tools separately.

#### Native Packages

Installation of native Mac packages should put you in good stead. Just follow the links and instructions therein.

#### 1) Git

Git may be installed directly from the git organization:

[http://git-scm.com/download/mac](http://git-scm.com/download/mac)

Git may also be installed as a command line tool component of Apple xCode, or independently via a Mac package manager like macports or brew, if you favor those.

You should simply install the most recent version available

##### 2) Nodejs

nodejs may be installed from the canonical home:

[https://nodejs.org](https://nodejs.org)

As of this time, please use version 8 of NodeJS. We try to stay on the most recent LTS release, but the most important constraint is that we are using the same major version across all environments - local dev, travis, CI and next/appdev/prod.

##### 3) npm global packages

It is no longer recommended to install the global version of npm-based development tools. Rather, they run out of the local kbase-ui repo. The local repo always installs these tools, since they are used by the build and testing tools.

For convenience, you may run 

```bash
. tools/devtools.sh
```

from a terminal window located at the kbase-ui repo directory to put the node executable directory into the current path.

> Note: yarn? Yes, we may be switching to yarn in the near future.

#### Macports

##### 1) Install Apple xCode

As mentioned above, you should have already installed xCode — xCode is required by macports.

##### 2) Install macports

Download and follow the instructions at [https://www.macports.org/install.php](https://www.macports.org/install.php).

> Macports will install its own binary path (/opt/local/bin:/opt/local/sbin/) ahead of the path used by xCode (/usr/bin). You can change that in ~/.profile if you wish.

##### 2) Use the terminal to install the dependencies using Macports

open Terminal and issue the following commands:

```
sudo port install nodejs6 npm5 git
```

Note that the version of nodejs is important. We try very hard to use the same version of nodejs in local development as KBase uses in build/deployment environments and as the Travis configuration uses. There are major changes between nodejs releases. Although a newer nodejs will be probably be able to run code written for an older version, the converse is not necessarily true, and it is certainly easy to start using features enabled by a newer node version if it is available. There may also be subtle differences in the building of dependencies through npm.

In general we try to stay on the most recent Long Term Support (LTS) of any dependency, but sometimes it takes us a while to have time to coordinate the concurrent update of all of the places they are used.

> Note: Although xCode installs git, the one available through macports is probably more up-to-date.



#### Homebrew

> to be done

### Windows

> to be done

### Linux

#### Ubuntu

> to be done

---

[Index](../index.md) - [README](../README.md) - [Release Notes](../../release-notes/index.md) - [KBase](http://kbase.us)

---