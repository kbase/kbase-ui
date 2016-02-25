# Prerequisites

In order to run the KBase UI you will need:

- standard javascript development tools to build the app,
- a web server which can serve up typical web file types

For development, you will need a common Javascript development toolchain, described below.

> Note: In the future we may provide the web app files in a pre-built state, but for now you need to build the runnable app from source.

KBase UI ships with a small testing web server running under *nodejs*, buf if you are doing continual development, already have a testing server, or any number of other cases, you may wish to use a system-level server. In production, KBase uses nginx as the web server front end, and in development nodejs is preferred since it is included and can be quickly started, stopped, and requires no additional system software.


## Overview

The KBase UI should build and run on any modern system: Mac OS X, Linux, FreeBSD, Windows.

At the system level, you will need to install the following packages:

- git
- nodejs
- npm

and for deployment

- nginx

These are only required for installation, and the KBase build tools are not super-sensitive to the precise version, as long as they are relatively recent. *git* is very stable, but *nodejs* is evolving rapidly and undergoes periodic major version bumps with accompanying breakage. As of this writing, we are using *nodejs* 4.2.3.

Installation of system level packages depends on ... the system you use, of course. Even within a platform there may be multiple ways to install a given package. In this document we provide instructions for installation on platforms in use at KBase using methods that we have employed.

## Macintosh

There are three main ways to install these tools natively on a Mac:

- Native Mac installation packages
- Macports
- Homebrew

(see the Linux section for Vagrant on Mac instructions.)

The requisite development packages are available as regualar Mac packages. This is surely the easiest way to get started. However, if you are going to be installing other Unixy tools, or have one of the following package managers installed, either Macports or Homebrew may be preferable, and are not much more difficult.


### Native Packages

Installation of native Mac packages should put you in good stead. Just follow the links and instructions therein.

#### 1) Git

[http://git-scm.com/download/mac](http://git-scm.com/download/mac)

#### 2) Nodejs

[https://nodejs.org](https://nodejs.org)

As of this time, please use the version 4 (e.g. 4.2.3) branch of NodeJS.

#### 3) npm packages

After nodejs is installed, from the Mac Terminal enter these commands:

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

#### optional
You may optionally install these tools globally. They will be installed locally and used by the build process, but if you anticipate using these tools from the command line you will have an easier time installing them globally.

```
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install -g karma-cli
```

> Note that phantomjs is installed as system binary, not through npm. Phantomjs itself is a little unstable, and contains dependencies which are not always met or installed by npm -- by the time you read this the npm install may work just fine.

### Homebrew

> to be done

## Windows

> We have not worked out a set of best-practice windows setup instructions yet, below is just an anecdote from one successful session.

We have performed an install, from scratch (starting with no dev tools whatsoever) on Windows 10, in about 15 minutes, which includes looking for and finding the appropriate windows installers.

You need to install the Windows packages for Git and Nodejs, and use the Git bash shell for command line stuff. Also, phantomjs is distributed as a simple binary, though we elected to install it via npm (```npm install -g phantomjs```). Experience shows that sometimes phantomjs does not play well when installed via npm, but I may be mistaken because it works fine on Windows -- although it is a little behind the official latest version (2.0.0), which actually may be a good thing since issues have been reported. On the other hand, there are js compatability issues reported for < 2.0.0 which will not be fixed.)

Occasionally you may be prompted for an admin account authorization if you are using a standard account. Other than that, the process was surprisingly smooth.

## Linux

### Ubuntu

> to be done, but see the Vagrant directions below.

## xxxBSD

### FreeBSD

> to be done

- Erik's notes: I tried a FreeBSD install last weekend (Jan 2016) and got stuck on phantomjs. I did not put more time into it.

### Vagrant with Ubuntu on Mac

> This section needs to be ironed out.

Using Vagrant, or a virtual machine directly, is a great way to test the canonical installation environment for KBase UI, which is Ubunto 14.04 (as of the time of writing.) It is also a great way to shake out prerequisites, to test out changes to prerequisites, and to generally create an isolated runtime, since you may not want to remove the requisite packages in your native working environment.

> Note: if you develop on Mac, it is also a requirement before submitting a PR to clone your prepared repo into an Ubuntu 14.04 environment and perform both unit and visual testing. This is due to, amongst other things, the need to file references which are case insensitive on Mac do not break on case sensitve Linux filesystems.

#### 1) First get a working VM up and running:

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

#### 2) You'll also need to expose your VM's IP address to your Mac. Here is one quick'n'dirty way:

- Use the following line to enable DHCP in your Vagrantfile. You can place it right below the commented out private_network config line

```
config.vm.network "private_network", type: "dhcp"
```

- Restart your vm

```
vagrant reload
```

- Inside your VM, note the IP address of the exposed virtual network interface:

```
vagrant ssh
ifconfig
```

This will probably be eth1 and look something like this:

```
eth1      Link encap:Ethernet  HWaddr 08:00:27:02:e0:08
          inet addr:172.28.128.5  Bcast:172.28.128.255  Mask:255.255.255.0
```


- Back on your host, create a new ip to host mapping. On Mac this is ```/etc/hosts``` as you might expect. The hosts name needs to match the host you choose in the nginx configuration (as described in [Quick Deploy](quick-deploy.md)).


```
172.28.128.5 dev.kbase.us
```
 

#### 3) See the [Quick Deploy](quick-deploy.md) doc for concise instructions on installation of requisite dependencies and kbase-ui itself.

---

[Index](index.md) - [README](../README.md) - [KBase](http://kbase.us)

---