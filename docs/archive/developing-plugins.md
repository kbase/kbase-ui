
# Developing kbase-ui Plugins

This guide covers a developer workflow for developing kbase-ui plugins, and deploying plugin and kbase-ui updates.

> Note this is for working on an *existing* plugin -- it does not cover creation of a plugin from scratch


- Prerequisites
- Setting Up
- Linking into kbase-ui
- Deploying updated plugin
- Integrating into kbase-ui
- Deploying updated kbase-ui

## Prerequisites

This guide does not cover setting up kbase-ui for development -- if you have not done that yet please see [development-setup.md](the development setup document).

Note: You will need to clone your fork of kbase-ui since you will eventually need to submit a minor pull request to update the plugin version for the ui build.

## Setting Up

Good, now that you have set up a kbase-ui development environment, it is time to integrate a plugin to work on.

### Fork the Plugin Repo

If you haven't yet, now is the time to fork the plugin repo at github.

All kbase plugins have an upstream repo in the kbase github account at https://github.com/kbase/kbase-ui-plugin-THEPLUGIN.

Note that all plugin repos are prefixed with kbase-ui-plugin-THEPLUGIN. This is not strictly a requirement, although some kbase-ui build tools will assume this, but it is good practice for a few reasons:

- it creates a uniqe name in the github namespace
- it createsa a unique name in the bower namespace (more on that later)
- it makes it easier to manage plugins in your project (they appear together in directory listings)

When we reference the *name* of a plugin, we always refer the the string occuring after *kbase-ui-plugin-*.

So, your task is to fork the repo you are interested in.

- create a github account if you do not already have one
    - if you are a kbase staff member and you already have a github account, you may wish to create a kbase account distinct from your other identity on github
- sign in to github if you are not already and ensure you are using the correct account for kbase work
- visit the github page for the plugin
    - the root page for all plugins is https://github.com/kbase
- fork the repo into your github account using the fork button


### Clone the Plugin Repo

First, open a terminal in the top level ```dev``` directory you set up to contain the kbase-ui repo.

```
Your-MBP:dev you$ |
```

The basic cloning method is to use https, like so

```
$ git clone https://github.com/YOURACCOUNT/kbase-ui-plugin-PLUGINNAME
```

If you want to avoid the need to enter your password every time you push changes back up to your account, you may want to set up an ssh key:

[https://help.github.com/articles/connecting-to-github-with-ssh/]().

If you have an ssh key for your current machine established for your github account, the clone command would look like

```
$ git clone ssh://git@github.com/YOURACCOUNT/kbase-ui-plugin-PLUGINNAME
```
 
 In either event, you have now established the plugin as a sister directory to kbase-ui. Your development directory should now look like:
 
 ```
 dev
    Vagrantfile
    kbase-ui
        ...
    kbase-ui-plugin-PLUGINNAME
        ...
 ```

### An aside: how plugins are built into kbase-ui

In the kbase-ui build configuration, there exists a configuration file listing all of the plugins to be built into the kbase-ui web app. This configuration file specifies the plugin name, the location and the version. 

The entry will look like this:

```
    -
        name: PLUGINNAME
        globalName: kbase-ui-plugin-PLUGINNAME
        version: 1.2.3
        cwd: src/plugin
        source:
            bower: {}
```

During the kbase-ui build process, the build tool uses the *bower* backage manager to locate and download the correct version of the plugin source from github and install it locally. The build tool then copies the src/plugin/modules directory into the kbase-ui modules/plugins directory, and uses the src/plugin/config.yml file to integrate plugin components into the ui.

Now, you may be able to see that one way to develop plugins is to simply update the plugin source, merge it into the repo, update the repo version, and rebuild kbase-ui. That is the short version of the steps necessary to integrate a plugin change! Although these steps are necessary for a well-managed system, it would be a very slow way to incrementally develop a plugin.

So, at develop-time, an alternative method is used. It is a cheat, to be honest, but a time-honored one. Since the plugin module directory is simply copied, whole-cloth, into the kbase-ui built source tree, we can simply make a *soft link* from the plugin repo into the kbase-ui build source. Then, as we make changes to the plugin source, a refresh of the web app will immediately reflect the changes.

This process is described below.

## Linking into kbase-ui

When you first initialized the kbase-ui repo, using the ```make init``` command, a development directory was populated with useful tools, including the *links.sh* utility. The links script is used to link source code into the kbase-ui build. This allows the kbase-ui web app to incorporate source changes immediately without the need to re-make the build. It contains examples, commented out, for linking plugins and library modules into the kbase-ui build.

### Add an entry link.sh for your plugin

In order to link your plugin into the kbase-ui source, you will need to add a *linkPlugin* entry.

This is as simple as added a line, like that below, using your favorite editor, to the file ```DEV/dev/tools/link.sh```

```
linkPlugin PLUGINNAME
```

> Note that all files in the dev directory are excluded from git, other than README.md.

### Run the link.sh script

Open a terminal in your development directory, change into the dev/tools directory, and run the script with bash.

```
cd kbase-ui/dev/tools
bash link.sh
```
A message should be printed to confirm that the linking was successful.

### Ensure it is working

To ensure that the linking was successful, you may wish to make a small change to the plugin, and then pull up the corresponding web app component in a web browser to confirm the change.

## Deploying updated plugin

[ to be done ]
[ this section will describe how to get your updated plugin back into the home repo and to increment the version]

### Updating your repo

### The pull request

### The version bump

## Integrating into  kbase-ui

[ to be done]
[ with an updated plugin, time to integrate it back into kbase-ui and ensure it works ]

### Updating plugins configurations

### Test each build

## Deploying updated kbase-ui

[ to be done ]
[ with an updated kbase ui, time to get that back into the home repo and up on ci ]

### Commit changes and push up to your fork

### Pull Request to the main repo



### Testing your PR

Testing the PR can take place alongside the development stuff, taking advantage of the vm and proxy that are already set up.

All this should be done in the vm, so open up a terminal in the vm if you don't have one already.

```
vagrant ssh
```

#### Ensure that the vm has the required kbase-ui dev dependencies:

```
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

#### Set up testing directory and clone repos

In the /vagrant directory, create a directory pr-testing

```
cd /vagrant
mkdir pr-testing
```

In this directory, clone the plugin and kbase-ui from the kbase account at github:

```
git clone -b develop https://github.com/kbase/kbase-ui
git clone https://github.com/kbase/kbase-ui-plugin-MYPLUGIN
```

In the plugin directory fetch the pull request 123 into a branch:

```
git fetch origin pull/123/head:test-123
git checkout test-123
```

#### Set up kbase-ui to use a local plugin directory 

Configure the build to use the local plugin for the build

```
cd kbase-ui
vi config/ui/ci/build.yml
```

in the section for the plugin change the source:

```
    -
        name: dataview
        globalName: kbase-ui-plugin-dataview
        version: 3.1.6
        cwd: src/plugin
        source:
            bower: {}
```

to this

```
    -
        name: dataview
        globalName: kbase-ui-plugin-dataview
        version: 3.1.6
        cwd: src/plugin
        source:
            directory: {}
```

> Note: be sure to preserve spaces and not use tabs; otherwise you will get a yaml error during the build

Build kbase-ui

```
make init
make build config=ci
```

#### Configure the vm's nginx for the testing directory

In the vm, edit the proxy root to point to this directory:

sudo vi /etc/nginx/sites-available/default

```
  location / {
    # next line for node testing server.
    gzip on;
    gzip_types text/css application/json application/javascript;

    # root /vagrant/kbase-ui/build/build/client;
    root /vagrant/pr-testing/kbase-ui/build/dist/client;

    # Uncomment to work against the minified dist build.
    # root /vagrant/kbase-ui/build/build/client;

    index index.html;
  }
  ```

  restart nginx

  ```
  service nginx restart 
  ```

### Test it

You should now be able to pull up https://ci.kbase.us in your favorite browser and confirm the changes.


### Merge and release into CI

When you are happy with the testing you can go ahead and have the PR merged.

[ TODO ]

merge the PR

tag the repo with a new version

update your local kbase-ui with the new version

your local kbase-ui, the one you are using for development, should be updated with the new plugin version. 

config/ui/dev/build.yml
config/ui/ci/build.yml

and if you are targeting production as well:

config/ui/prod/build.yml

then build kbase-ui and make sure it is working.

> If you want to, you can make the same change in your testing environment, since it is fully embedded in the vm.

with the changed config in kbase-ui

push it up to your repo

issue a PR against kbase-ui

have the PR merged



