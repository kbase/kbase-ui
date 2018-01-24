# Creating a New External Plugin

## Contents
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

## Setup

After setting up a new project directory as described in the [Getting Started](getting-started.md) guide, you should find yourself in a terminal opened inside the project directory. We'll refer to this as *~/work/project*.

## Clone Sample Plugin Repo

First we need to clone the sample plugin repo as a copy.

```bash
cd ~/work/project
git clone --depth=1 --branch=master https://github.com/eapearson/kbase-ui-plugin-simple-sample kbase-ui-plugin-MYPLUGIN
```

This will clone the sample plugin into a directory named after the new plugin name MYPLUGIN. This will not be functional git repo, since it was cloned with a depth of 1.

### Change the name of the plugin

The sample plugin name is *simple-sample*. This name is used in many places to namespace this plugin. In your IDE or tool of choice you can simply perform a global search-and-replace from "simple-sample" to "MYPLUGIN" (where MYPLUGIN) is the name of your new plugin.)

Your plugin name should be short, but fully descriptive of the purpose of the plugin. In this document when we use *MYPLUGIN* we mean the name you have chosen for your plugin.

At this time, the global search-and-replace will make the following changes:

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

> NOTE: You will discover that there are a few odds and ends that need to be changed as well, such as the menu label, the page title, and of course the sample content. We'll cover that later.

## Add plugin to kbase-ui config

In *kbase-ui*, each deployment has a plugin configuration file to control the features included in the kbase-ui build. Thus there is one for local development, ci and production. These files are located in *config/app/ci*, *config/app/dev*, and *config/app/prod*. Each deployment has three config files: *menus.yml*, *plugins.yml*, *services.yml*.

- *plugins.yml* - one entry per internal and external plugin to be included in the build
- *menus.yml* - hamburger menu entries
- *services.yml* - extra configuration for the internal ui services

During development you will typically need to modify both the CI and Dev configurations for plugins.yml, and sometimes menus.yml.

### plugins.yml

In plugins.yml you will need to add a new entry to the bottom of the plugins section.

Edit the file *~/work/project/kbase-ui/config/app/dev/plugins.yml*.

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

This entry uses the "directory" source. With this setting (you will notice that all others in the config file use "bower"), the kbase-ui build tool will fetch the plugin code from the local plugin directory. With the "bower" setting, which we will set later, the plugin code would be fetched from github.

### menus.yml

We'll add a menu item to the ui as well.

Edit the file *~/work/project/kbase-ui/config/app/dev/menus.yml*

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

The menu items in menus.yml are actually menu ids, even though they are often, as in this case, the same as the plugin name. The menu ids are set in *src/plugin/config.yml* in the menu section.  

## Test the new plugin

We'll take a short detour here to ensure that the plugin works, before completing the new plugin setup.

In the kbase-ui directory, build and run the image with the new configuration.

```bash
cd ~/work/project/kbase-ui
make build
make dev-image
make run-dev-image
```

Now point your favorite web browser to [https://ci.kbase.us](https://ci.kbase.us).

You should see the new menu item in the hamburger menu. Selecting the new menu item should show the default sample plugin content.

Although it is tempting to start working on the plugin, let's first finish the plugin configuration.

## Create Github Repo

You'll start by creating a github repo under your account. After the plugin is established, or at any time you wish, this repo should be transferred to the *kbase* github account.

- log into github.com
- select "New repository" from the "+" menu
- use the name "kbase-ui-plugin-MYPLUGIN" for the repo (where, as usual MYPLUGIN is the name you have chosen)

## Initialize and push the plugin

Back in your plugin's folder, convert it into a git repo and push it up to the new github repo you just created.

```bash
cd ~/work/project/kbase-ui-plugin-MYPLUGIN
git init
git remote add origin https://github.com/YOURACCOUNT/kbase-ui-plugin-MYPLUGIN
git add .
git commit -m "Initial commit for new plugin MYPLUGIN"
git push -u origin master
```

## Make the initial release

All external plugins are pulled into a kbase build by their version. The version is requested via bower, which in turn recognizes versions set up with the correct semver format as git tags in github.

Goto your github page for the plugin:

- Take your browser to https://github.com/YOURACCOUNT/kbase-ui-plugin-MYPLUGIN
- Select the "release" tab
- Click the "Draft a new release" button
- For "Tag version" enter "v0.0.1"
- For "Release title" enter "0.0.1"
- For "Describe this release" you may describe the initial state of the plugin, or simply leave it blank.
- For "This is a pre-relase", check the box

> Note that all releases before 1.0.0 are assumed to be in development, so I'm not sure that the pre-release status is necessary; it only appears in the github web ui, afaik.

## Register in Bower

In order for the kbase-ui build tool to be able to use bower to fetch the plugin, you need to first register it in the bower registry.

Back in your terminal:

```bash
bower register kbase-ui-plugin-MYPLUGIN https://github.com/YOURACCOUNT/kbase-ui-plugin-MYPLUGIN
```

> Caveats: Bower is deprecated - we simply haven't had time yet to move to another workflow.

> At a later time, after the repo is transfered to the kbase account, the plugin will need to be un-registered from your account and re-registered under kbase.


## Change the plugin from "directory" to "bower"

As mentioned above, we initially set the plugin configuration to be installed from a directory. We will now switch that to bower. Make the plugin entry we added bofore look like the one below (we are just changing ```source.directory: {}``` to ```source.bower: {}```)

```yaml
    -
        name: MYPLUGIN
        globalName: kbase-ui-plugin-MYPLUGIN
        version: 0.0.1
        cwd: src/plugin
        source:
            bower: {}
```

## Build and Confirm

Now you are ready to build kbase-ui again and confirm that the plugin has been integrated.

### Stop the container

First, you will need to stop the currently running container that you started earlier.

You can do this from the command line or using your favorite Docker management tool.

From the command line, you may issue 

```bash
docker stop $(docker ps -q)
```

this will stop all running containers. If you are currently using docker only for this project, this is a safe thing to do. This command first generates a list of running docker containers with *docker ps -q*, then it passes this list to the *docker stop* command to stop them.

On the Mac, I use *Kitematic*, a gui Docker management tool. I don't think it is included with Docker for Mac, but is available from the Docker for Mac menu. If you have multiple containers running, it is handy to pick the right one to stop; it is also very useful for exploring or configuring containers.

### Build and run again

Now lets build the ui and run it again to confirm that the changes worked.

```bash
cd ~/work/project/kbase-ui
make build
make dev-image
make run-dev-image
```

Now pull up your favorite browser to [https://ci.kbase.us](https://ci.kbase.us) to confirm that the plugin loaded correctly.

If you added a new menu item, confirm that it is in the menu, and select it.

If not, simply type in the path to invoke the top level panel. E.g. https://ci.kbase.us#myplugin/mypath.

If the plugin is not correctly registered in bower, or misconfigured in plugins.yml, or the menus.yml is incorrect, either the build or the initial load of the kbase-ui web app will fail.

## Make a few changes

As you will have noticed, this new plugin still looks like the sample plugin, because we haven't changed any of the sample content yet. Let's do that now.

### Developer Workflow

We have succeeded in having the ui built from the plugin by pulling a specific version down from it's github repo. This is critical for reproducible builds. However, during development time it we want to have our local changes reflected in the ui.

To accomplish this we just need to run the image with options to map the plugin folder into the container (this is described in more detail in the [external development workflow](developing-external-plugins.md) document.)

To accomplish this:

- stop the container, using the command line or a docker management tool
- start the container with the following commands:

```bash
cd ~/work/project/kbase-ui
bash deployment/dev/tools/run-image.sh dev -p MYPLUGIN
```

This will run the kbase-ui image while mounting the plugin directory inside, overriding the plugin directory that was included in the build.

> Yes, I know, this should be a make task, like make build, make dev-image, etc.

If you refresh browser, your plugin should still display.

### Menu Item

First lets take control of the menu item's label.

Edit the file *~work/project/kbase-ui-plugin-MYPLUGIN/src/plugin/config.yml*.

At the bottom of the file you'll see the *menu:* section. The *label:* property controls the display label for the menu item. Change it to whatever you like.

Now reload the browser, then click on the hamburger menu. You should see the change you just made.

Feel free to change the icon as well. The icon value is the suffix part of a [Font Awesome](http://fontawesome.io/icons/) icon class. The sample icon is a bicycle, so Font Awesome icon class is fa-bicycle.

### Page Title

The page title is set via a message sent to the ui. The page title is typically set in the widget associated with the current path. These widgets are referred to as "panel widgets" since they typically control the entire content panel of the ui.

You can find it in *~work/project/kbase-ui-plugin-MYPLUGIN/src/plugin/modules/panel.js*.

The line looks like:

```javascript
runtime.send('ui', 'setTitle', 'Simple Sample Plugin Title');
```

Simply change the text of the string *'Simple Sample Plugin Title'* to whatever you like. Upon reload this value will be reflected in the title area of the web app, and in the browser window title.

### Panel Content

The panel widget's content is also set in the *panel.js* file. In the sample the content is created using the *kb_common/html* module's *tag* function. The tag function allows for creation of html via a functional style. Towards the top of the module several tags are defined (div, p, etc.). When applied, these functions generate the corresponding html.

In the sample, a "layout" function is used to separate the content building from the point at which it is inserted into the DOM. This is a bit of a misnomer, since this example code was take from a more complex sample plugin which used the panel to simply compose subwidgets.

Please feel free at this point to modify the content and reload the browser to see your changes.

## Next Steps

- A separate document describes [external development workflow](developing-external-plugins.md) in more detail.
- Further examples of:
    - subwidgets
    - using jquery and kbwidget
    - using knockout components


---

[Index](index.md) - [README](../README.md) - [Release Notes](../release-notes/index.md) - [KBase](http://kbase.us)

---