# Quick Deploy Guide

This document provides steps to install kbase-ui into a working state on Ubuntu 14.04.

It can serve as a starting point for documentation tailored to specific deploy scenarios. In that case, we probably want to have a set of quick deployment documents (with links to common materials or more detailed explanations):

- CI
- Next
- Production
- Local dry-run

## Steps

### Prerequisites

Assume raw ubuntu 14.04; if that isn't the situation, you'll know what to ignore.

#### 1) Ensure system is up to date

I like to do this to ensure the  system is fully up to snuff.

E.g.

```
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get dist-upgrade -y
```

if dist-upgrade has something to do you should restart the instance

if you are advised to *autoremove*. Might as well do this with:

```
sudo apt-get autoremove -y
```


#### 2) get the NodeSource PPA:

The node with Ubuntu is very old -- antique by node standards -- and will not work with kbase-ui build tool requirements. We have been using 4.x and will migrate to 5.x in the future.

```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
```

#### 3) install packages

These are required for the build tools and providing a web server.

```
sudo apt-get install -y git build-essential libfontconfig1 nodejs nginx
```

- *ibfontconfig1* is for *phantomjs* -- a hidden dependency
- *build-essential* is for npm modules which include c-compilable code (e.g. phantomjs)

### Prepare kbase-ui

You'll want to be in whatever filesystem location is acceptable for creating the build directory.

#### 1) Clone kbase-ui

```
git clone https:\\github.com\kbase\kbase-ui
```

This will install the current master. If you want a specific release:

```
git clone --branch v0.1.3 --depth 1 https://github.com/eapearson/kbase-ui
```

#### 2) Make the distribution

```
cd kbase-ui
make init
make build config=ENV
```

- ```make init``` will install build tools locally
- ```make build target=ENV``` will build the base, and possibly the dist, depending on the build target settings.
    - build targets include *ci*, *next*, *prod*

> Where are the configurations for this? See [configuration](configuration.md)

#### 3) Deploy it

```
sudo ./deploy.sh
```

> PLEASE make a better deploy.sh.

### Web server

Of course, kbase-ui is nothing unless it is fronted by an http server.

The prerequisites already installed a stock nginx server.

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
  server_name narrative.kbase.us;
  location / {
      try_files $uri $uri/ =404;
  }
}
```

- Since kbase-ui is served at https:, you may need to add an ssl server as well, depending on the front end proxy requirements.
- In addition, the server_name may be different depending on those requirements as well.
