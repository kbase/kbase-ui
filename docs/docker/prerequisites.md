# Prerequisites

The developer setup provides a workflow and small set of tools to help develop kbase-ui, plugins, and associated libraries. These tools provide for javascript development on your host (main desktop) environment, and a docker image for running kbase-ui behind a local proxy.

The requirements are:

- nodejs - The V8 javascript system, required for building kbase-ui and running tests
- git - the source revision management tool with integration into github
- docker - the linux container manager you will use to run kbase-ui

## Basic Development Requirements

### Overview

The KBase UI should build and run on any modern system: Mac OS X, Linux, Windows.

Procecedures for installation of system level packages depends on ... the system you use! Even within a platform there may be multiple ways to install a given package. In this document we provide instructions for installation on platforms in use at KBase using methods that we have employed and work.

# Installation

## All environments

The following tools are available on all supported platforms (Mac, Windows, Linux). Please consult the installation instructions at the respective web sites:

- Docker - [https://www.docker.com](https://www.docker.com)

That leaves us with nodejs and git to install through other means.

### Macintosh

There are three main ways to install these tools natively on a Mac:

- Native Mac installation packages
- Macports
- Homebrew

(see the Linux section for Vagrant on Mac instructions.)

The requisite development tools are available as regualar Mac packages. This is may be the easiest way to get started. However, if you are going to be installing other Unixy tools, or have one of the following package managers installed, either Macports or Homebrew may be preferable, and are not much more difficult. Package managers also make updating your tools easy, whereas the downloadable packages will need to be periodically updated manually.

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

As of this time, please use the version 6 (e.g. 6.11.2) branch of NodeJS.

##### 3) npm global packages

you may optionall install the global version of npm-based development tools.

After nodejs is installed, from the Mac Terminal enter these commands:

```
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install -g karma-cli
```

The globally installed tools are not used by the build process. The build process installs tools locally in the kbase-ui repo directory during the build process. In addition to making deployment simpler, the internally installed tools are pinned to a specific version, making builds more deterministic.

However, having these tools available globally on your host can ease certain development tasks, such as running grunt tasks, karma tests, or bower things like registration of a plugin.

#### Macports

##### 1) Install Apple xCode

xCode may be installed from the Apple App Store for free.

Let's face it, you should really have xCode installed, even if you use a Mac package manager.

##### 2) Install macports

Download and follow the instructions at [https://www.macports.org/install.php](https://www.macports.org/install.php).

> Macports will install its own binary path (/opt/local/bin:/opt/local/sbin/) ahead of the path used by xCode (/usr/bin). You can change that in ~/.profile if you wish.

##### 2) Use the terminal to install the dependencies using Macports

open Terminal and issue the following commands:

```
sudo port install nodejs git
```

> Although xCode installs git, the one available through macports is probably more up-to-date.


##### optional

You may optionally install the following tools globally.

```
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install -g karma-cli
```

 These tools are installed globally on your host machine, in a the /opt/local/ filesystem.

 > The build process does not use these tools, but they can come in handy for manually performing tasks.

#### Homebrew

> to be done

### Windows

> We have not worked out a set of best-practice windows setup instructions yet, below is just an anecdote from one successful session.

We have performed an install, from scratch (starting with no dev tools whatsoever) on Windows 10, in about 15 minutes, which includes looking for and finding the appropriate windows installers.

You need to install the Windows packages for Git and Nodejs, and use the Git bash shell for command line stuff. Also, phantomjs is distributed as a simple binary, though we elected to install it via npm (```npm install -g phantomjs```). Experience shows that sometimes phantomjs does not play well when installed via npm, but I may be mistaken because it works fine on Windows -- although it is a little behind the official latest version (2.0.0), which actually may be a good thing since issues have been reported. On the other hand, there are js compatability issues reported for < 2.0.0 which will not be fixed.)

Occasionally you may be prompted for an admin account authorization if you are using a standard account. Other than that, the process was surprisingly smooth.

## Linux

#### Ubuntu

> to be done

---

[Index](index.md) - [README](../README.md) - [KBase](http://kbase.us)

---