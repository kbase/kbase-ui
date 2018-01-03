# Creating a New External Plugin

- set up your dev env
    - [Prerequisites](prerequisites.md)
    - [Getting Started](getting-started.md)
- Clone the sample plugin repo with new name
- Initialize repo
- Create gitub repo
- Push local repo to github
- Make initial release
- Register in bower
- add plugin to kbase-ui config
    - plugins
    - integrate into menu if necessary
- build and confirm
- enter external development workflow
- later...
    - transfer repo to kbase
    - unregister in bower
    - register kbase repo in bower
- alternate workflows
    - use directory rather than bower



## Set Up Dev Env

## Clone Sample Plugin Repo

First we need to clone the sample plugin repo as a copy.

```bash
git clone --depth=1 --branch=master https://github.com/eapearson/kbase-ui-plugin-sample kbase-ui-plugin-MYPLUGIN
```

This will clone the sample plugin into a directory named after the new plugin name MYPLUGIN. This will not be git repo, since it was cloned with a depth of 1.

## Initialize the Repo

Convert this into a new repo

```bash
cd kbase-ui-plugin-MYPLUGIN
git init
```

## Create Github Repo

You'll start by creating a github repo under your account. After the plugin is established, or at any time you wish, the plugin should be transferred to the kbase github account.

Do that

## Push local repo to github

You'll want to create the initial commit and then push it up to your new repo

```bash
git add .
git commit -m "Initial commit for new plugin MYPLUGIN"
git push -u origin master
```

## Make the initial release

All external plugins are pulled into a kbase build by their version. The version is requested via bower, which in turn recognizes versions set up with the correct semver format as git tags in github.

Goto your github page for the plugin:

- Take your browser to https://github.com/eapearson/kbase-ui-plugin-MYPLUGIN
- Select the "release" tab
- Click the "Draft a new release" button
- For "Tag version" enter "v0.0.1"
- For "Release title" tnere "0.0.1"
- For "Describe this release" you may describe the initial state of the plugin, or simply leave it blank.
- For "This is a pre-relase", check the box

> Note that all releases before 1.0.0 are assumed to be in development, so I'm not sure that the pre-release status is necessary.

## Register in Bower

Back in your terminal:

```bash
bower register kbase-ui-plugin-MYPLUGIN https://github.com/YOURACCOUNT/kbase-ui-plugin-MYPLUGIN
```

> Caveats: Bower is deprecated - we simply haven't had time yet to move to another workflow.

> At a later time, after the repo is transfered to the kbase account, the plugin will need to be un-registered from your account and re-registered under kbase.


## Add plugin to kbase-ui config

Now that the plugin has been created, we need to register it in kbase-ui so that it is pulled down and included in the build. Any paths defined within the plugin will automatically be available. However, if you want to add a menu item, which is often handy especially during development, you will need to perform additional configuration.

In kbase-ui, each deployment has a plugin configuration file to control the features included in the kbase-ui build. Thus there is one for local development, ci and production. These files are located in config/app/ci, config/app/dev, and config/app/prod. Each deployment has three config files: menus.yml, plugins.yml, services.yml.

- plugins.yml - one entry per internal and external plugin to be included in the build
- menus.yml - hamburger menu entries
- services.yml - extra configuration for the internal ui services

During development you will typically need to modify both the CI and Dev configurations for plugins.yml, and optionally menus.yml.

### plugins.yml

In plugins.yml you will need to add a new entry to the bottom of the plugins: section.

```yaml
    -
        name: PLUGINNAME
        globalName: kbase-ui-plugin-PLUGINNAME
        version: 0.0.1
        cwd: src/plugin
        source:
            bower: {}
```

### menus.yml

If you have a menu entry to add to the development or CI build, you will need to modify the menus.yml file.

Even if the final ui build will not require a new hamburger menu entry, it can be handy to add one for local development and for CI previewing.

```yaml
menus:
    authenticated:
        main: [narrative, bulk-ui]
        developer: [example-trr, staging-browser, example-gopherjs, reske-admin, reske-object-search,jgi-search, tester, test_dynamic_table, paveldemo, sdkclientstest, databrowser, typebrowser, jobbrowser, shockbrowser]
        help: [about, about-services, contact-kbase, help]
    unauthenticated:
        main: []
        developer: []
        help: [about, contact-kbase, help]
```

There is one menu configuration to be used when the session is authenticated, and one when it is not. Typically you will only add items to the authenticated menu.

If the menu is to be available only for development and previewing, add it to the "developer:" menu. If it is meant to be rolled out into production in the primary menu, add it to the "main:" section. 

The sample plugin project is set up with an initial menu item defined as "sample". To utilize this in the developer menu simply add the item "sample" to the array of menu ids in the developer: property. If you change the name of the menu item (and it is good practice to name menu items after the plugin, unless they are core), you will need the associated change in the menus.yml file.

## Build and Confirm

Now you are ready to build kbase-ui and confirm that the plugin has been integrated.

```bash
cd ~/work/dev/kbase-ui
make build
make dev-image
make run-dev-image
```

Now pull up your favorite browser to https://ci.kbase.us to confirm that the plugin loaded correctly.

If you added a new menu item, confirm that it is in the menu, and select it.

If not, simply type in the path to invoke the top level panel. E.g. https://ci.kbase.us#myplugin/mypath.

If the plugin is not correctly registered in bower, or misconfigured in plugins.yml, or the menus.yml is incorrect, either the build or the initial load of the kbase-ui web app will fail.

## enter external development workflow

You are now ready to use the [external development workflow](developing-external-plugins.md) to iteratively develop the plugin.