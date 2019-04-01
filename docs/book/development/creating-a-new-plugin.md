# Creating a New Plugin

This document describes the process for creating a new kbase-ui plugin and integrating it into the kbase-ui build. It is best if you have already absorbed [Developing a Plugin](developing-a-plugin.md).

[TOC]

## Prerequisities

- [Prerequisites](prerequisites.md)
- [Getting Started](getting-started.md)
- [Developing a Plugin](developing-a-plugin.md)



## Setup

After setting up a new project directory as described in the [Getting Started](getting-started.md) guide, you should put yourself in a terminal opened inside the project directory, *~/work/project*.

## Clone Sample Plugin Repo

First we need to clone the sample plugin repo as a copy.

```bash
cd ~/work/project
git clone --depth=1 --branch=master https://github.com/eapearson/kbase-ui-plugin-simple-sample kbase-ui-plugin-MYPLUGIN
```

This will clone the sample plugin into a directory named after the new plugin name MYPLUGIN. This will not be functional git repo, since it was cloned with a depth of 1.

> Note: We should move the simple-sample plugin into the kbase account

### Change the name of the plugin

The sample plugin name is *simple-sample*. This name is used in many places to namespace this plugin. In your IDE or tool of choice you can simply perform a global search-and-replace from "simple-sample" to "MYPLUGIN" (where MYPLUGIN) is the name of your new plugin.)

Your plugin name should be short, but fully descriptive of the purpose of the plugin. In this document when we use *MYPLUGIN* we mean the name you have chosen for your plugin.

At the time of writing the global search-and-replace will make the following changes, with additional changes you may to to make noted

- bower.json
    - changes the name property from "kbase-ui-plugin-simple-sample" to "kbase-ui-plugin-MYPLUGIN"
    - changes the property repository.url to point to the github repo

- src/plugin/config.yml
    - changes the package.name property from "simple-sample" to "MYPLUGIN"
    - YOU: also change the author and description if appropriate
    - changes the install.widgets[0].id from simple-sample_panel to MYPLUGIN_panel
    - changes the intall.routes[0].path from [simple-sample] to [MYPLUGIN]
    - changes the install.routes[0].widget from simple-sample_panel to MYPLUGIN_panel
    - changes the install.menu.name property form simple-sample to MYPLUGIN
    - changes the install.menu.definition.path from [simple-sample] to [MYPLUGIN]

- src/plugin/resources/css
    - changes the class name plugin_simple-sample_panel to plugin_MYPLUGIN_panel

- src/plugin/modules
    - changes the class name list 'plugin_simple-sample_panel container-fluid' to 'plugin_MYPLUGIN_panel container-fluid' 

> NOTE: You will discover that there are a few odds and ends that need to be changed as well, such as the menu label, the page title, and of course the sample content. We'll cover that later.

## Add plugin to kbase-ui config

In order for a plugin to be made available and integrated into kbase-ui, several files in kbase-ui need to be modified.

- build configuration file - specify the plugin id and version
- build services configuration file - specify menu items which should appear
- deployment environment file - a menu item specified above may be disabled in one or more deployments

### plugins.yml

The primary entry point for a plugin into *kbase-ui* is the `plugins.yml` config file. This file lists all of the plugins which will be loaded into kbase-ui.

Since there are two build types for kbase-ui, the local developer build and the main production build, there are two plugin configuration files. This allows us to iterate quickly over new development, have the work shared via github, and the have the work reviewable without introducing the code into a shared environment just yet.

However, in practice we introduce new plugins destined for production into both the dev and prod build configurations. We have a second barrier for code to enter production, the develop / master branch practice, in which develop is used for local develop and CI, and master for next, appdev, and production.

On the other hand, we do not like to create much distance from the develop branch and master, in terms of deployable features. Thus, if we have new plugins introduced into the prod build in the develop branch, and they are in an unstable state, we may introduce friction  and uncertaintly in efforts to merge develop into master and initiate and deployment.

Well, back to the task at hand, in plugins.yml you will need to add a new entry to the bottom of the plugins section.

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

This entry uses the "directory" source. With this setting (you will notice that all others in the config file use "bower"), the kbase-ui build tool will fetch the plugin code from the local plugin directory. With the "bower" setting, which we will set later, the plugin code would be fetched from github via the bower package manager.

### services.yml

We'll add a menu item to the ui as well.

Menu items appearing in the hamburger and sidebar menus are defined in plugins, but their appearance in a menu and order are defined in the ui itself.

The menu configuration is located within the *services.yml* file. This file contains the default configuration for all kbase-ui services. A kbase-ui service is an internal process which is responsible for some aspect of the user interface. In this case the *menu* service is responsible for providing the list of menus. (An internal plugin is responsible for displaying them.)

Edit the file *~/work/project/kbase-ui/config/app/dev/services.yml*

Below is the current developer menu configuration:

```yaml
menu:
      menus:
        hamburger:
          sections: 
            main:
              items:
                -
                  id: narrative
                  auth: true
                -
                  id: jgi-search
                  auth: true
            developer:
              items: 
                -
                  id: dagre-example
                  auth: true
                -
                  id: simple-search
                  auth: true
                -
                  id: simple-sample
                  auth: true
                -
                  id: narrative-finder
                  auth: true
                -
                  id: staging-browser
                  auth: true
                -
                  id: example-gopherjs
                  auth: true
                -
                  id: reske-admin
                  auth: true
                -
                  id: reske-object-search
                  auth: true
                -
                  id: tester
                  auth: true
                -
                  id: test_dynamic_table
                  auth: true
                -
                  id: paveldemo
                  auth: true
                -
                  id: databrowser
                  auth: true
                -
                  id: typebrowser
                  auth: true
                -
                  id: shockbrowser
                  auth: true
            help:
              items:
                -
                  id: about
                  auth: false
                -
                  id: about-services
                  auth: true
                -
                  id: contact-kbase
                  auth: false
                -
                  id: help
                  auth: false
        sidebar:
          sections:
            main:
              items:
                -
                  id: dashboard
                  auth: true
                -
                  id: appcatalog
                  auth: false
                -
                  id: search
                  auth: true
                -
                  id: jobbrowser
                  # The label can ovveride the label from the plugin here
                  label: Jobs
                  auth: true
                -
                  id: account
                  auth: true
                -
                  id: feeds
                  auth: true
                  allow: [alpha]
```

You can see that menu items are defined for the hamburger and sidebar, and that each is divided into sections. 

The hamburger menu has three sections — main, developer, and help. Only the main and help sections currently appear in any production site, while developer appears in CI and local development. The main section contains the primary hamburger menu actions. When the sidebar menu was introduced, years after the hamburger menu, the hamburger menu was more or less relegated to secondary functions. The help menu is generally for help and reference. The developer menu is used for tools which are useful for ui developers (especially in the local dev build), and for internal users (who might be using CI.)

The sidebar menu contains a single *main* section, and is the primary navigation to core kbase-ui features. Each of these features is provided by a plugin.

So, back to adding the menu item. The menu item fieldsa are:

- `id` - the internal menu id as provided by the plugin
- `auth` - true if the menu item should only appear with the ui is in a logged-in (authenticated/authorized) state; most menu items require this
- `label` - optional, may be used to override the menu label defined in the plugin; not often used, usually to relabel the menu until the plugin can be updated
- `allow` - optional, a list of enablements for which this menu item may be displayed; if missing, implies that the menu item always appears (honoring the auth flag); if provided the menu item will only appear when the ui contains the specified enablements. Useful for having menu items only appear if the ui is enabled for alpha, beta, or experimental features.

Since each menu item generally corresponds to the entry point for a plugin, the menu id is usually simply the plugin id.

The sample plugin we are working with was set up that way, and the search and replace you (hopefully) performed earlier would have transformed this to MYPLUGIN.

So...

Add the following entry to the developer menu (where new plugins typically first appear):

```yaml
-
  id: MYPLUGIN
  auth: true
```

This is going into the local dev build, so we don't have to put any conditions on the menu item appearing.

## Test the new plugin

We'll take a short detour here to ensure that the plugin works, before completing the new plugin setup.

In the kbase-ui directory, build and run the image with the new configuration.

```bash
cd ~/work/project/kbase-ui
make build config=dev
make image build=build
make run-image env=dev
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
- For "Tag version" enter "v0.1.0"
- For "Release title" enter "0.1.0"
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

First, you will need to stop the currently running container that you started earlier. Remember, that is simply `Ctrl` + `C`.

### Build and run again

Now lets build the ui and run it again to confirm that the changes worked.

```bash
cd ~/work/project/kbase-ui
make build config=dev
make image build=build
make run-image env=dev
```

Now pull up your favorite browser to [https://ci.kbase.us](https://ci.kbase.us) to confirm that the plugin loaded correctly.

If you added a new menu item, confirm that it is in the menu, and select it.

If the plugin is not correctly registered in bower, or misconfigured in plugins.yml, or the services.yml is incorrect, either the build or the initial load of the kbase-ui web app will fail.

## Make a few changes

As you will have noticed, this new plugin still looks like the sample plugin, because we haven't changed any of the sample content yet. Let's do that now.

### Developer Workflow

We have succeeded in having the ui built from the plugin by pulling a specific version down from it's github repo. This is critical for reproducible builds. However, during development time it we want to have our local changes reflected in the ui.

To accomplish this we just need to run the image with options to map the plugin folder into the container (this is described in more detail in the [developing a plugin](developing-a-plugin.md) document.)

To accomplish this:

- stop the container
- start the container with the following commands:

```bash
cd ~/work/project/kbase-ui
make run-image env=dev plugins=MYPLUGIN
```

This will run the kbase-ui image while mounting the plugin directory inside, overriding the plugin directory that was included in the build.

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

The panel widget's content is also set in the *panel.js* file. In the sample the content is created using the *kb_lib/html* module's *tag* function. The tag function allows for creation of html via a functional style. Towards the top of the module several tags are defined (div, p, etc.). When applied, these functions generate the corresponding html.

In the sample, a "layout" function is used to separate the content building from the point at which it is inserted into the DOM. This is not necessary, but it is generally good practice to keep invoke a simple point of entry to construct the panels layout, outside of the *attach* or *start* lifecycle method in which the layout DOM is necessarily updated.

Please feel free at this point to modify the content and reload the browser to see your changes.

## Next Steps

- A separate document describes the ongoing process of [developing a plugin](developing-a-plugin.md) in more detail.


---

[Index](../index.md) - [README](../README.md) - [Release Notes](../../release-notes/index.md) - [KBase](http://kbase.us)

---