# Quick Deploy Guide


# Deploying the KBase UI


## Steps

### Prerequisites

Assume raw ubuntu 14.04; if that isn't the situation, you'll know what to ignore.

#### 1) Ensure system is up to date

I like to do this to ensure the  system is fully up to snuff.

E.g.

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get dist-upgrade
```

- if dist-upgrade you should restart the instance
- if you are advised to *autoremove*. Might as well do this with ```sudo apt-get autoremove```.


#### 2) get the NodeSource PPA:

The node with Ubuntu is very old -- antique by node standards -- and will not work with kbase-ui build tool requirements.

```
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
```

#### 3) install packages

These are required for the build tools and providing a web server.

```
sudo apt-get install -y git build-essential libfontconfig1 nodejs nginx
```

- libfontconfig1 is for phantomjs -- a hidden dependency
- build tools is for npm modules which include c-compilable code (e.g. phantomjs)

### Prepare kbase-ui

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
make build target=ENV
```

- ```make init``` will install build tools locally
- ```make build target=ENV``` will build the base, and possibly the dist, depending on the build target settings.
    - build targets include ci, next, prod

> Where are the configurations for this? See [configuration](configuration.md)

#### 3) Deploy it

```
sudo ./deploy.sh
```

> PLEASE make a better deploy.sh.

### Web server

Of course, kbase-ui is nothing unless it is served by an http server.

In the current deploy environment, there should already be a running nginx, but we'll pretend there isn't.

Replace the default nginx config file with one appropriate for the deployment environment.

The following is a very simple example for a non-https testing server:

```
server {
  listen 80 default_server;
  listen [::]:80 default_server ipv6only=on;
  root /kb/deployment/services/kbase-ui
  index index.html;
  server_name narrative.kbase.us;
  location / {
      try_files $uri $uri/ =404;
  }
}
```

- Since kbase-ui is served at https:, you may need to add an ssl server as well, depending on the front end proxy requirements.
- In addition, the server_name may be different depending on those requirements as well.
