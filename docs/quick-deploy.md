# Quick Deploy Guide

This document provides steps to install *kbase-ui* into a working state on Ubuntu 14.04.

It can serve as a starting point for specific deployment scenarios. In that case, we probably want to have a set of quick deployment documents (with links to common materials or more detailed explanations):

- CI
- Next
- Production
- Local testing

## Steps

### Prerequisites

Assume raw, freshly installed Ubuntu 14.04; if that isn't the situation, you'll know what to ignore.

#### 1) Ensure system is up to date

```
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get dist-upgrade -y
```

if *dist-upgrade* performs installs you should restart the Ubuntu instance.

If you are advised to *autoremove*. Might as well do this with:

```
sudo apt-get autoremove -y
```


#### 2) get the NodeSource PPA:

The nodejs distributed with Ubuntu is very old -- antique by node standards -- and will not work with *kbase-ui* build tool requirements. We are currently using 4.2.x, so install that package source into Ubuntu:

```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
```

#### 3) install packages

These are required for the build tools and for providing a web server.

```
sudo apt-get install -y git build-essential libfontconfig1 nodejs nginx
```

- *ibfontconfig1* is a hidden dependency for *phantomjs*
- *build-essential* is for npm modules which include c-compilable code (e.g. phantomjs)

### Prepare kbase-ui

You'll want to be in whatever filesystem location is acceptable for creating the kbase-ui repo directory. In certain build modes (e.g. dev) a *temp* directory will be created with the directory which contains the kbase-ui repo, so you may wish to create and use a directory to contain the kbase-ui repo.

```
mkdir kbase-ui-working
cd kbase-ui-working
```

#### 1) Clone kbase-ui

```
git clone https://github.com/kbase/kbase-ui
```

This will install the current master. 

For CI or normal development you will want the develop branch:

```
git clone -b develop https://github.com/kbase/kbase-ui
```

Or if you want a specific release:

```
git clone --branch v0.1.3 --depth 1 https://github.com/eapearson/kbase-ui
```

#### 2) Make the distribution

```
cd kbase-ui
make init
make build config=ci
```

- ```make init``` will install build tools locally
- ```make build config=ci``` will build the base the dist.
    - build configs include *ci*, *next*, *prod*, and *dev*
    - the default is *dev*

For example, to make a build suitable for or to emulate CI

```
make build config=ci
```

> Where are the configurations for this? See [configuration](configuration.md)

#### 3) Deploy it

This installs the *dist* directory created above into the standard KBase runtime directory ```/kb/deployment/services/kbase-ui```.

```
sudo ./deploy.sh
```

> PLEASE make a better deploy.sh.

### Web server

Of course, kbase-ui is nothing unless it is fronted by an http server.

We have already installed the nginx server above.

Replace the default nginx config file with one appropriate for the deployment environment.

E.g. 

```
sudo vi /etc/nginx/sites-available/default
```

And then empty the file and copy/paste in the following very simple example non-secure server:

```
server {
  listen 80 default_server;
  listen [::]:80 default_server ipv6only=on;
  root /kb/deployment/services/kbase-ui;
  index index.html;
  server_name dev.kbase.us;
  location / {
      try_files $uri $uri/ =404;
  }
}
```

- Since kbase-ui is served at https:, you may want to add an ssl server as well, depending on the front end proxy requirements.
- The *server_name* may be whatever you want, *dev.kbase.us* is just an example (not in use publicly at KBase.)

> TODO add basic ssl self-signed cert instructions, very handy for testing.

---

[Index](index.md) - [README](../README.md) - [KBase](http://kbase.us)

---