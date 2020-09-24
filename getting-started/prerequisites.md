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

| app    | version | notes                                                                     |
| ------ | ------- | ------------------------------------------------------------------        |
| docker | 18.x.x  | the linux container manager you will use to build and run kbase-ui        |
| git    | \*      | the source revision management tool with integration into github          |
| make   | >= 3.8  | any relatively recent make should work                                    |
| node   | >= 8    | any recent version should work                                            |
| npm    | 6       | although yarn is preferred, npm is useful in some edge cases              |
| yarn   | \*      | yarn is compatible by and large with npm, but simpler and faster, and required into the kbase-ui tools |

> \* we haven't documented any substantial differences between these tools regarding the kbase-ui development process. However, it is best to keep them always at the most recent version by updating your tool stack periodically.

The reason for the relaxed version requirements is that kbase-ui is built inside of a Docker build process, using specific software package versions which are installed into a Docker image. The software requirements specified above are for local development tools only.

## macOS

In a nutshell, here is my standard install:

1. Install Apple xCode
2. Install macports (some prefer homebrew)
3. Install prerequisites with macports (or homebrew)
4. Install Docker Desktop

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

I don't use brew, so can't provide instructions or experience reports.

[ TODO ]

### Installing prerequisites

#### Native

##### Docker

Docker is best installed using it's native install tool. This distribution of Docker is Docker Desktop, and is available for MacOS and Windows. Docker also be be installed as a pure command-line tool via macports or brew. The Docker Desktop version, though, is very useful for inspecting running containers, including opening terminals into them. Not that this can't be accomplished from the command line, but 

[https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

##### git, make

Git and make are installed with xCode and may be used as is.

They tend to run a bit behind their respective releases, so you may have a need to install the macports or homebrew versions as well.

E.g. I use the macports `git`, but the xCode `make`.

#### macPorts

```bash
sudo port install nodejs10 git yarn
```

> Note that npm should be installed with nodejs.

> You may install any version of nodejs which works for you; see the [available macports nodejs packages](https://ports.macports.org/?search=nodejs&search_by=name).

#### homebrew

[ TODO ]


## Linux

[ TODO ]

## Windows

[ TODO ]