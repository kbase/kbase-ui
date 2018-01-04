# Creating a New External Plugin

- set up your dev env
    - [Prerequisites](prerequisites.md)
    - [Getting Started](getting-started.md)
- Clone the sample plugin repo with new name
    - Change the name of the repo in various places
- Test the new plugin
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
git clone --depth=1 --branch=master https://github.com/eapearson/kbase-ui-plugin-simple-sample kbase-ui-plugin-MYPLUGIN
```

This will clone the sample plugin into a directory named after the new plugin name MYPLUGIN. This will not be git repo, since it was cloned with a depth of 1.

### Change the name of the plugin

The sample plugin name is "simple-sample". This name is used in many places to namespace this plugin. In your IDE or tool of choice you can simply perform a global search and replace form "simple-sample" to you MYPLUGIN (where MYPLUGIN) is the name of your new plugin.) Or you may make the following changes:

- bower.json
    - change the name property from "kbase-ui-plugin-simple-sample" to "kbase-ui-plugin-MYPLUGIN"
    change the property repository.url to point to the github repo

- src/plugin/config.yml
    - change the package.name property from "simple-sample" to "MYPLUGIN"
    - also change the author and description if appropriate
    - change the install.widgets[0].id from simple-sample_panel to MYPLUGIN_panel
    - change the intall.routes[0].path from [simple-sample] to [MYPLUGIN]
    - change the install.routes[0].widget from simple-sample_panel to MYPLUGIN_panel
    - change the install.menu.name property form simple-sample to MYPLUGIN
    - change the install.menu.definition.path from [simple-sample] to [MYPLUGIN]

- src/plugin/resources/css
    - change the class name plugin_simple-sample_panel to plugin_MYPLUGIN_panel

- src/plugin/modules
    - change the class name list 'plugin_simple-sample_panel container-fluid' to 'plugin_MYPLUGIN_panel container-fluid' 

## Add plugin to kbase-ui config

In kbase-ui, each deployment has a plugin configuration file to control the features included in the kbase-ui build. Thus there is one for local development, ci and production. These files are located in config/app/ci, config/app/dev, and config/app/prod. Each deployment has three config files: menus.yml, plugins.yml, services.yml.

- plugins.yml - one entry per internal and external plugin to be included in the build
- menus.yml - hamburger menu entries
- services.yml - extra configuration for the internal ui services

During development you will typically need to modify both the CI and Dev configurations for plugins.yml, and sometimes menus.yml.

### plugins.yml

In plugins.yml you will need to add a new entry to the bottom of the plugins section. This entry will use the "directory" source. With this setting (you will notice that all others in the config file use "bower"), the kbase-ui build tool will fetch the plugin code from the local plugin directory. With the "bower" setting, which we will set later, the plugin code would be fetched from github.

Edit the file ~/work/dev/kbase-ui/config/app/dev/plugins.yml

At the bottom of the file add this (replacing MYPLUGIN with the plugin name you have chosen)

```yaml
    -
        name: MYPLUGIN
        globalName: kbase-ui-plugin-MYPLUGIN
        version: 0.1.0
        cwd: src/plugin
        source:
            directory: {}
```

### menus.yml

We'll add a menu item to the ui as well.

Edit the file ~/work/dev/kbase-ui/config/app/dev/menus.yml

Within the authenticated section, add the menu item MYPLUGIN at the beginning of the developer menu list.

E.g.

```yaml
menus:
    authenticated:
        main: [narrative, bulk-ui]
        developer: [MYPLUGIN, staging-browser, example-gopherjs, reske-admin, reske-object-search,jgi-search, tester, test_dynamic_table, paveldemo, sdkclientstest, databrowser, typebrowser, jobbrowser, shockbrowser]
        help: [about, about-services, contact-kbase, help]
    unauthenticated:
        main: []
        developer: []
        help: [about, contact-kbase, help]
```

## Test the new plugin

We'll pause here to ensure that the plugin works, before completing the new plugin setup.

In the kbase-ui directory, build and run the image with the new configuration.

```bash
cd ~/work/dev/kbase-ui
make build
make dev-image
make run-dev-image
```

You should see the new menu item in the hamburger menu. Selecting the new menu item should show the default sample plugin content.

Although it is tempting to start working on the plugin, we will proceed to finish the plugin configuration.

## Create Github Repo

You'll start by creating a github repo under your account. After the plugin is established, or at any time you wish, the plugin should be transferred to the kbase github account.

- log into github.com
- select "New repository" from the "+" menu
- use the name "kbase-ui-plugin-MYPLUGIN" for the repo (where, as usual MYPLUGIN is the name you have chosen)

## Initialize and push the plugin

Back in your development folder, convert the new plugin into a git repo and push it up to the new github repo you just created.

```bash
cd ~/work/dev/kbase-ui-plugin-MYPLUGIN
git init
git remote add origin https://github.com/YOURACCOUNT/kbase-ui-plugin-MYPLUGIN
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
- For "Release title" enter "0.0.1"
- For "Describe this release" you may describe the initial state of the plugin, or simply leave it blank.
- For "This is a pre-relase", check the box

> Note that all releases before 1.0.0 are assumed to be in development, so I'm not sure that the pre-release status is necessary. 

## Register in Bower

In order for the kbase-ui build tool to be able to use bower to fetch the plugin, you need to first register it in the bower registry.

Back in your terminal:

```bash
bower register kbase-ui-plugin-MYPLUGIN https://github.com/YOURACCOUNT/kbase-ui-plugin-MYPLUGIN
```

> Caveats: Bower is deprecated - we simply haven't had time yet to move to another workflow.

> At a later time, after the repo is transfered to the kbase account, the plugin will need to be un-registered from your account and re-registered under kbase.


## Change the plugin from "directory" to "bower"

## Add plugin to kbase-ui config

As mentioned above, we initially set the plugin configuration to be installed from a directory. We will now switch that to bower. Make the plugin entry we added bofore look like the one below (we are just changing source.directory: {} to source.bower: {})

```yaml
    -
        name: PLUGINNAME
        globalName: kbase-ui-plugin-PLUGINNAME
        version: 0.0.1
        cwd: src/plugin
        source:
            bower: {}
```

## Build and Confirm

Now you are ready to build kbase-ui again and confirm that the plugin has been integrated.

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