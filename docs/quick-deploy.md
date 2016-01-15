# Quick Deploy Guide


# Deploying the KBase UI


## Steps

### Prerequisites

assume raw ubuntu 14.04

ensure system is up to date

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


### Clone kbase-ui

```
git clone https:\\github.com\kbase\kbase-ui
```

This will install the current master. If you want a specific release:

```
git clone https:\\github.com\kbase\kbase-ui
```

 Select which branch or tag


### Make


### Make deploy




### nodejs


