# Prerequisites

The kbase-ui web app is used as a Docker image. For basic usage, including building and running the Docker image, just two applications are required: docker and git.

For full-blown development of kbase-ui, these same two dependencies would suffice, but in practice you will need a javascript development stack. Please see the [Development](../development/README.md) for all the gory details.

## Basic Requirements

You will need to ensure that you have a basic set of the following tools on your host desktop machine. These tools are available on Mac, Linux, and Windows.

| app | version | notes |
|-----|---------|------ |
| git    | 18.x.x | the source revision management tool with integration into github |
| docker | * | the linux container manager you will use to run kbase-ui |

> \* we haven't documented any substantial differences between these tools regarding the kbase-ui development process. However, it is best to keep them always at the most recent version by updating your tool stack periodically.

You may have noticed that there are no Javascript tools above, such as nodejs or npm, or development tools such as make. This is because kbase-ui is built inside of a Docker build process, using build tools installed into a Docker image.

It is certainly possible to build kbase-ui locally on your host machine, and this is described in the [Development](../development/README.md) documentation. However, for normal deployment and development, this should not be necessary.


### git

git is used to fetch kbase-ui and any other repos that may be involved in a given development effort. Of course, if you are making source code changes it is a critical tool in the development process.

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

Open Terminal and issue the following commands:

```
sudo port install git
```

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

