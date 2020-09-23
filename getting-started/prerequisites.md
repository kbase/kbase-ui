---
---

# Prerequisites

kbase-ui development utilizes many of the development tools commonly associated with web browser Javascript development

- a good editor or IDE
- npm and/or yarn
- make
- git
- docker

Most kbase-ui developers have used MacOS, but the tools above can be used with Linux, BSD, or Windows.

Additional applications may be required for optional tasks.

Although you may build kbase-ui directly in your development host environment, the normal, and most stable, practice is to build within docker containers.

The development host is used primarily for:

- editing code with the editor or IDE of your choice
- managing the codebase with git
- automating build and other tasks with make
- running integration and unit tests
- managing this documentation

For certain development tasks, or to run specific phases of the development process, additional tools may be required, but nothing out of the ordinary Javascript development toolkit. 

## Basic Requirements

You will need to ensure that you have a basic set of the following tools on your host desktop machine. These tools are available on Mac, Linux, and Windows.

| app    | version | notes                                                              |
| ------ | ------- | ------------------------------------------------------------------ |
| docker | 18.x.x  | the linux container manager you will use to build and run kbase-ui |
| git    | \*      | the source revision management tool with integration into github   |
| make   | >= 3.8  | any relatively recent make should work                             |
| node   | >= 8    | any recent version should work                                     |

> \* we haven't documented any substantial differences between these tools regarding the kbase-ui development process. However, it is best to keep them always at the most recent version by updating your tool stack periodically.

The reason for the relaxed version requirements is that kbase-ui is built inside of a Docker build process, using specific software package versions which are installed into a Docker image. The software requirements specified above are for local development tools only.

## OS-Specific pre-prerequisites

Some OSes may require specific tools to bootstrap the process of installing kbase-ui development prerequisites.

### macOS

#### Apple xCode

xCode may be installed from the Apple App Store for free, and is highly recommended for any developer workstation. Not only does it provide some of the required tools, but some macOS developer tools require xCode be installed.

xCode includes both git and make, which are required for building kbase-ui, as well as a compilers which may be required to install other developer tools via installers from macports, npm, and the like.

#### MacPorts

MacPorts is a package manager for macOS. It differs from another popular macOS package manager, HomeBrew, in that it requires root access (sudo) to install packages.

Download and follow the instructions at [https://www.macports.org/install.php](https://www.macports.org/install.php).

> Macports will install its own binary path (/opt/local/bin:/opt/local/sbin/) ahead of the path used by xCode (/usr/bin). You can change that in ~/.profile if you wish.

> You'll need to open a new Terminal window in order to pick up the path changes.

> xCode may be required by Macports to install certain packages (some are distributed as binary, some need to be compiled.)

#### brew

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

git is used to fetch kbase-ui and any other repos involved in a given development effort. Of course, if you are making source code changes it is a critical tool in the development process.

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

Distribution of Docker changes from time to time. Currently it is best to consult the [Docker Store](https://store.docker.com/search?type=edition&offering=community), which should list a distribution for macOS, Windows, and various Linux distributions.

That failing, just explore [Docker](https://docker.com).
