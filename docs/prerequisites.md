# Prerequisites

In order to run the KBase UI you will need a web server which can serve up typical web file types. It will need to point to a single directory, and probably require almost no configuration. The [installation](installation.md) instructions describe how to set up the two supported configurations, nginx and nodejs. In production, KBase uses nginx as the web server front end, and in development nodejs is preferred since it is included and can be quickly started, stopped, and requires no additional system software.

For development, you will need a common Javascript development toolchain, described below.

## System Requirements

The kbase-ui should build and run on any modern system: Mac OS X, Linux, FreeBSD, Windows.

At the system level, you will need to install the following packages:

- git
- nodejs
- npm

These are only required for installation, and the KBse build tools are not super-sensitive to the precise version, as long as they are relatively recent. git is very stable, but nodejs is evolving rapidly and undergoes periodic major version shifts. As of this writing, we are using nodejs 4.2.3, so the version 4 line, although version 5.3.0 is out. We experienced failures with version 5, and have not attempted again.

Installation of system level packages depends on ... the system you use, of course. Even within a platform there may be multiple ways to install a given package. In this document we provide instructions for installation on platforms in use at KBase using methods that we have employed.

## Macintosh

There are three main ways to install these tools natively on a Mac:

- Regular Mac installation packages
- Macports
- Homebrew

(see the Linux section for Vagrant on Mac instructions.)

The requisite development packages are available as regualar Mac packages. This is surely the easiest way to get started. However, if you are going to be installing other Unixy tools, or have one of the following package managers installed, either Macports or Homebrew may be preferable, and are not much more difficult.


### Regular packages

Installation of regular Mac packages should put you in good stead. Just follow the links and follow the instructions.

#### 1) Git

[http://git-scm.com/download/mac](http://git-scm.com/download/mac)

#### 2) Nodejs

[https://nodejs.org](https://nodejs.org)

As of this time, please use the version 4 (e.g. 4.2.3) branch of NodeJS.

#### 3) npm packages

From the Mac Terminal enter these commands:

```
sudo npm install -g phantomjs
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install -g karma-cli
```

> TODO: verify these instructions. This was from memory, and should be verified to note any exceptions, or catch any missing steps.

### Macports

#### 1) install macports: 

Download and follow the instructions at [https://www.macports.org/install.php](https://www.macports.org/install.php).

> As part of the macports install, you will need to also install xcode and/or xcode command line utils. This can take up to an hour.

#### 2) Use the terminal to install the dependencies using Macports.

open Terminal and issue the following commands:

```
sudo port install npm phantomjs
```

You may optionally install these tools globally. They will be installed locally and used internally by the Makefile, but if you anticipate using these tools from the command line you will have an easier time installing them globally.

```
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install -g karma-cli
```

> Note that phantomjs is not installed through npm, but may be (as in the regular package instructions). It is simply an option whether one wants to install a binary like phantomjs with npm or as a native package. You can inspect the version of each and see if one is more appropriate.

### Homebrew

> to be done

## Windows

> We have not worked out a set of best-practice windows setup instructions yet, below is just an anecdote from one successful session.

We have performed an install, from scratch (starting with no dev tools whatsoever) on Windows 10, in about 15 minutes, which includes looking for and finding the appropriate windows installers.

You need to install the Windows packages for Git and Nodejs, and use the Git bash shell for command line stuff. Also, phantomjs is distributed as a simple binary, though we elected to install it via npm (```npm install -g phantomjs```). Experience shows that sometimes phantomjs does not play well when installed via npm, but I may be mistaken because it works fine on Windows -- although it is a little behind the official latest version (2.0.0), which actually may be a good thing since issues have been reported. On the other hand, there are js compatability issues reported for < 2.0.0 which will not be fixed.)

Occasionally you may be prompted for an admin account authorization if you are using a standard account. Other than that, the process was surprisingly smooth.

## Linux

### Ubuntu

> to be done

### ??

### Vagrant on Mac

> This section needs to be ironed out.

Using Vagrant, or a virtual machine directly, is a great way to test the canonical installation environment for KBase UI, which is Ubunto 14.04 (as of the time of writing.) It is also a great way to shake out prerequisites, to test out changes to prerequisites, and to generally create an isolated runtime, since you may not want to remove the requisite packages in your native working environment.

First get a working VM up and running:

```
vagrant init ubuntu/trusty64
vagrant up
vagrant ssh
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get dist-upgrade -y
exit
vagrant reload
vagrant ssh
```

The node with Ubuntu is very old -- antique by node standards -- and will not work with kbase-ui requirements.

get the NodeSource PPA:

```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
```

and build tools

this is for npm modules which include c-compilable code (e.g. phantomjs)

```
apt-get install build-essential
```

this is for phantomjs -- a hidden dependency

```
sudo apt-get install libfontconfig1
```

You are now ready to install use kbase-ui