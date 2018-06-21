# Prerequisites

The kbase-ui web app is used as a Docker image. For basic usage, including building and running the Docker image, just two applications are required: docker and git.

For full-blown development of kbase-ui, these same two dependencies would suffice, but in practice you will need a javascript development stack. Please see the [Development](../development/README.md) for all the gory details.

## Basic Requirements

You will need to ensure that you have a basic set of the following tools on your host desktop machine. These tools are available on Mac, Linux, and Windows.

| app | version | notes |
|-----|---------|------ |
| git    | * | the source revision management tool with integration into github |
| docker | * | the linux container manager you will use to run kbase-ui |

> \* we haven't documented any substantial differences between these tools regarding the kbase-ui development process. However, it is best to keep them always at the most recent version by updating your tool stack periodically.

You may have noticed that there are no Javascript tools above, such as nodejs or npm, or development tools such as make. This is because kbase-ui is built inside of a Docker build process, using build tools installed into a Docker image.

It is certainly possible to build kbase-ui locally on your host machine, and this is described in the [Development](../development/README.md) documentation. However, for normal deployment and development, this should not be necessary.


### git

git is simply used to fetch kbase-ui and any other repos that may be involved in a given development effort.

#### MacOS

On MacOS, git is available through xCode, macports, brew, and an installer from git.

##### Apple xCode

xCode may be installed from the Apple App Store for free, and is highly recommended for any developer workstation. Not only does it provide some of the required tools, but some macOS developer tools require xCode be installed.

xCode includes both git and make, which are required for building kbase-ui, as well as a compilers which may be required to install other developer tools via installers from macports, npm, and the like.

Although xCode includes git, make and other developer tools, you may also opt to install these or similar (e.g. gmake) tools separately.


#### Native Package from git

Installation of native Mac packages should put you in good stead. Just follow the links below and instructions therein.

[http://git-scm.com/download/mac](http://git-scm.com/download/mac)

#### Macports

##### 1) Install Apple xCode

xCode may be required by Macports to install certain packages (some are distributed as binary, some need to be compiled.)

xCode is available for free from the App Store.

##### 2) Install Macports

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


#### Linux

As a Linux user, you should be familiar with the package management tools for the distribution you use. Without a version constraint, you should just install the most recent version available.

E.g. for Ubuntu

```bash
sudo apt-get install git
```

#### Windows

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

### MacOS

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