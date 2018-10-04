# Prerequisites

The kbase-ui is a web app, composed of html, javascript, css, data files, image files, and many other assets. As a web app it can be used behind just about any type of web server. In order to use the web app, it must operate on a supported KBase host. Practically this means that it should operate behind a proxy server which itself operates on the KBase host. (These hosts are https://X.kbase.host, where X is ci, next, appdev, and narrative).

In deployments, KBase uses an nginx proxy front end and rancher to orchestrate kbase-ui and other services which operate to form a connected set of services.

For basic kbase-ui usage and local development, a special docker-compose configuration provides a proxy container as well as kbase-ui container to simulate this service configuration.

The requirements for them are simple: make, git, and docker.

For certain development tasks, or to run specific phases of the development process, additional tools are required, but nothing out of the ordinary Javascript development toolkit. These are described in the [developer documentation](../development/README.md)

## Basic Requirements

You will need to ensure that you have a basic set of the following tools on your host desktop machine. These tools are available on Mac, Linux, and Windows.

| app | version | notes |
|-----|---------|------ |
| make | >= 3.8 | any relatively recent make should work |
| git    | * | the source revision management tool with integration into github |
| docker | 18.x.x | the linux container manager you will use to run kbase-ui |

> \* we haven't documented any substantial differences between these tools regarding the kbase-ui development process. However, it is best to keep them always at the most recent version by updating your tool stack periodically.

You may have noticed that there are no Javascript tools above, such as nodejs or npm, or development tools such as make. This is because kbase-ui is built inside of a Docker build process, using build tools installed into a Docker image.

It is certainly possible to build kbase-ui locally on your host machine, and this is described in the [Development](../development/README.md) documentation. However, for normal deployment and development, this should not be necessary.

## macOS

### Apple xCode

xCode may be installed from the Apple App Store for free, and is highly recommended for any developer workstation. Not only does it provide some of the required tools, but some macOS developer tools require xCode be installed.

xCode includes both git and make, which are required for building kbase-ui, as well as a compilers which may be required to install other developer tools via installers from macports, npm, and the like.

### MacPorts

MacPorts is a package manager for macOS. It differs from another popular macOS package manager, HomeBrew, in that it requires root access (sudo) to install packages.

Download and follow the instructions at [https://www.macports.org/install.php](https://www.macports.org/install.php).

> Macports will install its own binary path (/opt/local/bin:/opt/local/sbin/) ahead of the path used by xCode (/usr/bin). You can change that in ~/.profile if you wish.

> You'll need to open a new Terminal window in order to pick up the path changes.

> xCode may be required by Macports to install certain packages (some are distributed as binary, some need to be compiled.)

### brew

[ to be done ]

## make

The ubiquitous and venerable "make" program is used to automate just about all of the tasks for development and deployment.

### MacOS

The make program is installed with xCode, and that version seems adequate.

Note that the make installed with xCode is GNU make, which is good, because it is compatible with Linux. This may be true of xCode tools, but generally macOS distributes BSD versions of other unixy tools like sed and grep. 

### Windows

[ to be done ]

### Linux

[ to be done ]

## git

git is used to fetch kbase-ui and any other repos that may be involved in a given development effort. Of course, if you are making source code changes it is a critical tool in the development process.

### MacOS

On MacOS, git is available through xCode, macports, brew, and an installer from git.

#### Apple xCode

Although xCode includes git, make and other developer tools, you may also opt to install these or similar (e.g. gmake) tools separately.

#### Native Package from git

Installation of native Mac packages should put you in good stead. Just follow the links below and instructions therein.

[http://git-scm.com/download/mac](http://git-scm.com/download/mac)

#### Macports

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

### Windows

[ to be done ]

## docker 

Distribution of Docker changes from time to time. Currently it is best to consule the [Docker Store](https://store.docker.com/search?type=edition&offering=community), which should list a distribution for macOS, Windows, and various Linux distributions.

That failing, just explore [Docker](https://docker.com).

