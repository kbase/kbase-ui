# Prerequisites

In general you will need to install these packages into your system directly:

- git
- nodejs

It should not matter which version of these packages you install, as long as they are relatively recent. git is very stable, but nodejs is evolving rapidly and undergoes periodic major version shifts. As of this writing, we are using nodejs 4.2.3, so the version 4 line, although version 5.3.0 is out. The version 5 line has suffered some hiccups after initial release, and some plugins  

Once nodejs is installed, these node packages need to be installed globally with npm:
- bower
- karma

Don't worry, instructions for common use cases are shown below:

## Macintosh

There are three main ways to install these tools natively on a Mac:

- regular Mac installation packages
- Macports
- Homebrew

(see the Linux section for Vagrant on Mac instructions.)


### Regular packages

The requisite development packages are available as regualar Mac packages. This is surely the easiest way to get started. However, if you are going to be installation other Unixy tools, either Macports or Homebrew offer a more uniform environment for doing so.

#### 1) Git

[http://git-scm.com/download/mac](http://git-scm.com/download/mac)

#### 2) Nodejs

[https://nodejs.org](https://nodejs.org)

As of this time, please use the version 4 (e.g. 4.2.3) branch of NodeJS.

### Macports

#### 1) install macports: 

Download and follow the instructions at [https://www.macports.org/install.php](https://www.macports.org/install.php).

> As part of the macports install, you will need to also install xcode and/or xcode command line utils. This can take up to an hour.

#### 2) Use the terminal to install the dependencies using Macports.

open terminal and issue the following commands:

```
sudo port install npm phantomjs
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install -g karma-cli
```


## Windows

I (Erik) performed an install, from scratch (starting with no dev tools whatsoever) on Windows 10, in about 15 minutes, which includes looking for and finding the appropriate windows installers.

You need to install the Windows packages for Git and Nodejs, and use the Git bash shell for command line stuff. Also, phantomjs is distributed as a simple binary, so I elected to install it via npm (npm install -g phantomjs) I seem to recall that phantomjs does not play well when installed via npm, but I may be mistaken because it works fine on Windows -- although it is a little behind the official latest version (2.0.0), which may be a good thing since issues have been reported. On the other hand, there are js compatability issues reported for < 2.0.0 which will not be fixed.)

Occasionally you may be prompted for an admin account authorization if you are using a standard account. Other than that, the process was surprisingly smooth.

## Linux

## Vagrant on Mac

Using Vagrant, or a virtual machine directly, is a great way to test the canonical installation environment for KBase UI, which is Ubunto 14.04 (as of the time of writing.) It is also a great way to shake out prerequisites, to test out changes to prerequisites, and to generally create an isolated runtime.

```
vagrant init ubuntu/trusty64
vagrant up
vagrant ssh
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
exit
vagrant reload
vagrant ssh
sudo apt-get -y install git npm nodejs-legacy phantomjs
# weird I had to do the following - must be a vagrant thing.
sudo chown vagrant /home/vagrant/tmp 
sudo npm install -g bower
sudo npm install -g grunt-cli
sudo npm install -g karma-cli
```
