# Kbase-ui: Plugin with iframe integration

## Background

## How it Works

## Plugin Integration

## Basic Plugin

The kbase-ui plugin feature allows a compatible javascript git repo to integrate into kbase-ui. Integration works through a combination of configuration, convention, and luck.

### Convention

Each plugin is expected to meet the following requirements:

-   Have a valid bower.json file at the root
-   Have a directory inside of which resides all the plugin code. In most plugins, this is src/plugin, but it doesn’t need to be
-   Have a plugin configuration file located at src/plugin/config.yml

Any modules referenced in the configuration file are located in the module subdirectory

### Configuration

Plugin configuration is found in two locations - in the plugin itself, and in kbase-ui.

#### Plugin Configuration

The plugin configuration provides definitions of key aspects the plugin which may be integrated into the ui, including:

-   Menu item definitions - label, icon, route
-   Routes and the widget which handles them
-   Widget modules

The plugin config file provides other features, which are less often used and might be considered deprecated.

The essential use case for a plugin is that it provides a menu item which invokes a route, a route which invokes a panel, and a set of widgets, components, and library code which supports that panel.

A plugin may provide a route without a menu component. Examples include the user profile, data landing pages, and type landing pages.

#### UI Configuration

A plugin is integrated into the ui codebase during the build process by way of the plugins.yml configuration file found in config/app/dev/plugins.yml and config/app/prod/plugins.yml.
The reason for two configuration files is that the development build may include highly experimental plugins or plugins which support development which we do not want to have appear in the production codebase. (This distinction, though, is not important any longer and we should reduce down to a single one.)

The plugin configuration

## Getting Started

### Prepare a working directory

E.g.

```
mkdir project
cd project
```

### Set up the kbase-ui repo

Clone the kbase-ui repo, make sure you can’t push to it,

```
git clone -b payoff https://github.com/kbase/kbase-ui
cd kbase-ui
git remote set-url --push origin nopush
```

If you haven’t yet forked the kbase-ui repo, please do so at github.

Add your fork as a remote:

```
git remote add fork ssh://git@github.com/YOU/kbase-ui
```

### Ensure the state of kbase-ui is usable

Since the `payoff` branch is under continuous development, it is wise to first make sure it builds and operates before building a workflow around it.

```
make dev-start built-image=t
```

### Set up the plugin repo

Clone the plugin repo you are working on. If you haven’t forked it at github, please do so now.

```
cd ..
git clone -b payoff https://github.com/kbase/kbase-ui-plugin-PLUGIN
```

> note - the plugin repo should already have the payoff branch; if not, and git throws an error, do so. You may need to contact the repo owner.

Project the origin from accidental pushing, and clone your fork as a remote as well

```
cd kbase-ui-plugin-PLUGIN
git remote set-url --push origin nopush
git remote add fork ssh://git@github.com/YOU/kbase-ui-plugin-PLUGIN
```

#### If you need to - create the payoff branch

As noted above, you need to be working on the `payoff` branch of the plugin. This section describes one way of adding that branch, if it does not exist yet.

1. Goto the repo in github: `https://github.com/kbase/kbase-ui-plugin-PLUGIN`
2. Click the Branch dropdown, which shows master by default.
3. In the input with the placeholder text “Find or create a branch…” type `payoff`.
4. Click “Create branch: payoff” in the branches tab showing below.

> If you cannot create the branch at GitHub due to lack of permissions, you will either need to request permission, or simply ask a repo admin to create the branch for you.

### Open the plugin in your IDE

Depending on your IDE, it may be most convenient to open your plugin in the IDE or Editor directly from the command line. E.g. in Visual Studio Code

```
code .
```

### Install the kbase ui tools in the project directory

```
git clone https://github.com/eapearson/kbase-ui-tools
```

These tools include scripts to help with the conversion from a classic plugin to an iframe plugin.

At present this repo contains starter files and libraries, but does not provide automation scripts. Rather, the conversion process is manual. The section below provides step-by-step instructions.

## Converting a Plugin

### Adjust kbase-ui’s plugin configuration to enable this plugin

In `project/kbase-ui/config/app/plugins.yml` there should already be a commented-out entry for this plugin. (All existing plugins were commented out at the beginning of this project.)

Uncomment the entry for this plugin.

Replace the `version:` field with `kbase-ui-plugin-PLUGIN#payoff`.

Where PLUGIN is the plugin name.

### Rebuild the ui with this existing plugin.

```
cd project/kbase-ui
make dev-start env=dev build=dev build-image=t
```

It probably won't work yet - we haven’t made any functional code changes yet and the payoff-branch of kbase-ui has dropped many dependencies used by plugins. We are primarily testing that the ui builds correctly with this plugin added.

#### Copy eslint file

Open the plugin in your editor or IDE

For editing sanity, copy the eslint config file from kbase-ui-tools to the plugin. We need to copy `kbase-ui-tools/assets/.eslintrc.yml` to `kbase-ui-plugin-PLUGIN` at the project root

For example:

```
cp kbase-ui-tools/assets/.eslintrc.yml kbase-ui-plugin-PLUGIN
```

#### Move the contents of src/plugin to src/plugin/iframe_root

The file movement tasks should be conducted in the file manager (Finder); some IDEs do not support moving or copying of files very well.

Or third party tool, e.g. “Commander One”, may be more convenient.

-   Create directory src/plugin/iframe_root
-   Move modules, resources (if present), config.yml to iframe_root

E.g.

```
mkdir kbase-ui-plugin-PLUGIN/src/plugin/iframe_root
mv kbase-ui-plugin-PLUGIN/src/plugin/* kbase-ui-plugin-PLUGIN/src/plugin/iframe_root
```

#### Copy the build directory

From kbase-ui-tools, copy assets/plugin/build to the root of the plugin

This provides a mechanism for fetching and "vendoring" all dependencies for this plugin.

It will contain a set of all dependencies this plugin may need (all of those that were in kbase-ui originally). Later you may remove any unnecessary dependencies.

> It is possible you will need to amend the dependencies to add missing ones.

E.g.

```
cp -pr kbase-ui-tools/assets/plugin/build kbase-ui-plugin-PLUGIN
```

#### Update .gitignore

Since we are going to be installing NPM and Bower packages, we need to ensure that the downloaded source is not included in the plugin repo.

You’ll need to edit the `.gitignore` file in your plugin root directory, adding the following entries:

```
node_modules/
bower_components/
```

#### Copy iframe support source into plugin:

From kbase-ui-tool, copy the contents of `assets/plugin/iframe_support/modules/iframe_support` to the plugin’s plugin directory `src/plugin`.

This will copy starter and support files needed for the iframe.

Note that the modules directory needs to be merged (not replace the modules directory). The standard `cp` command will acheive this.

E.e.

```
cp -pr kbase-ui-tools/assets/plugin/iframe_support/* kbase-ui-plugin-PLUGIN/src/plugin/iframe_root
```

#### Move the original config file

Within the plugin, move `src/plugin/iframe_root/config.yml` to `src/plugin/iframe_root/modules/config.yml`

The config.yml is loaded by main.js for compatibility. The easiest way to load a yaml file is through AMD, which requires that the file be within the module root directory.

> TODO: can we drop this?

E.g.

```
mv kbase-ui-plugin-PLUGIN/src/plugin/iframe_root/config.yml kbase-ui-plugin-PLUGIN/src/plugin/iframe_root/modules
```

#### Copy the host support into plugin

The kbase-ui-tool includes support for integrating an iframe-based plugin into kbase-ui.

From tool:

Copy `assets/plugin/host_support/*` to the plugin root, `src/plugin`.

This includes a stub config, example primary panel, and all supporting libraries.

E.g.

```
cp -pr kbase-ui-tools/assets/plugin/host_support/* kbase-ui-plugin-PLUGIN/src/plugin
```

#### Restart kbase-ui

Restart the local kbase-ui, this time specifying the current plugin for local overriding.

```
make dev-start env=dev build=dev build-image=f plugins=”PLUGIN”
```

At this point you should just see the ui appear, without any changes.

#### Invoke the stub “hello” view

Take your browser to https://ci.kbase.us#example

The usual caveats:

-   Ensure localhost is mapped to ci.kbase.us
-   Use a private browser window in order to be able to accept the self signed certificate

By default the plugin assets that we copied over above will be configured to simply display static content inside the iframe.

The display of this test view indicates that the basic mechanism for loading the iframe works.

Now we need to wire in the iframe web app.

#### Change “example” to “PLUGIN”

Some of the files we copied from kbase-ui-tools use "example" as a placeholder for the plugin. Before proceeding, we should replace all such usages of example with the plugin name.

In `src/plugin/config.yml`, copied from kbase-ui-tools, “example” is used as a placeholder for the actual plugin name.

Replace instances of “example” with the name of your plugin. It is best to conduct this with case sensitivity, and to separately refactor "example", "Example" and other usages which may appear.

Take your browser to https://ci.kbase.us#PLUGIN. You may need to reload the url after changing it, in order to reload the kbase-ui. You should see the same "hello" content.

#### Fix menu

Consult the original `kbase-ui-plugin-PLUGIN/src/plugin/iframe_root/modules/config.yml` file to ensure that the new `kbase-ui-plugin-PLUGIN/src/plugin/config.yml` file specifies the correct menu item, if applicable, including the original label and icon.

The widget the menu is associated with should stay as it is.

If there is more than one route defined in the original config.yml, we’ll address those later. Just pick the most sensible one to start with.

#### Set up menu items in kbase-ui

Menu items are defined in top level config.yml, but will not appear in the ui unless they are enabled in the kbase-ui configuration.

The files `config/app/services.yml` contains the definitions of both the hamburger and sidebar navigation.

After updating the ui services.yml files, you’ll need to rebuild the ui

```
make dev-start env=dev build=dev build-image=t plugins="PLUGIN"
```

Reload https://ci.kbase.us#PLUGIN again to ensure that the menu item has appeared correctly.

You should still see the "hello" placeholder content for the plugin when you click on the menu item for it.

#### Install dependencies into iframe

The iframe dependencies are “installed” by “vendoring” packages fetched with bower and npm.

In a terminal in the plugin’s top level directory

```
cd build
npm install
./node_modules/.bin/bower-installer
```

##### Check for out of date npm dependencies

We do this when opportunity presents itself, just to keep the difference between current releases and those in use as small as possible.

```
npm outdated
```

If there are any listed, consider addressing them in this plugin codebase by updating the version specified in `build/package.json`.

If you have updated dependencies, perform another npm install

##### Check for out of date bower dependencies

```
./node_modules/.bin/bower list
```

This displays the dependency tree; packages with newer versions are indicated.

If you feel that a version update is necessary, you'll need to make the change to `build/bower.json`.

If you made changes to `bower.json`, re-run bower-installer.

> Also consider propagating the same updates into kbase-ui-tools

> Note that major version upgrades should only be updated if you are sure they will be compatible with the plugin. Bower will not let you install packages if a version is changed to become incompatible with other packages.

This should have downloaded the build dependencies, downloaded the bower dependencies, and copied app dependencies into the plugin directory `src/plugin/iframe_foot/modules/vendor`.

#### Uncomment the lines in index.html to activate it

We are now ready to move beyond the static markup in the iframe index file and start getting the actual plugin to work.

1. Edit the plugin file `src/plugin/iframe_root/index.html`.
1. Remove the "hello" static markup.
1. Uncomment the javascript loading lines which are indcated

E.g.

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <base target="_parent" />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no" />
        <meta name="theme-color" content="#000000" />
        <title>Organizations</title>
        <link href="./index.css" rel="stylesheet" />
        <link href="./css/kbase-ui.css" rel="stylesheet" />
        <!-- Load plugin-wide style below, or via the main boot script. -->
        <!-- UNCOMMENT LINE BELOW TO ENABLE PLUGIN APP -->
        <!-- <link href="./css/main.css" rel="stylesheet" /> -->
    </head>
    <body class="kbase-ui">
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <!-- UNCOMMENT 2 LINES BELOW TO ENABLE PLUGIN APP -->
        <!-- <div id="root" class="root scrollable-flex-column Example"></div> -->
        <!-- <script async src="./modules/vendor/requirejs/require.js" data-main="main"></script> -->
        <!-- REMOVE REST OF THIS BODY TO ENABLE PLUGIN APP -->
        <h1>Hello</h1>
        <p>This is a good sign, the plugin is now loading the iframe.</p>
        <p>
            Now for the fun. It all starts with un-commenting the two lines above in the source for index.html, and
            working on main.js.
        </p>
    </body>
</html>
```

becomes

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <base target="_parent" />
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1,shrink-to-fit=no" />
        <meta name="theme-color" content="#000000" />
        <title>Organizations</title>
        <link href="./index.css" rel="stylesheet" />
        <link href="./css/kbase-ui.css" rel="stylesheet" />
        <!-- Load plugin-wide style below, or via the main boot script. -->
        <link href="./css/main.css" rel="stylesheet" />
    </head>
    <body class="kbase-ui">
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root" class="root scrollable-flex-column Example"></div>
        <script async src="./modules/vendor/requirejs/require.js" data-main="main"></script>
    </body>
</html>
```

Before we can successfully attempt to load the plugin, we need to complete the rewiring of at least one route.

#### Wire in plugin routes, one at a time.

This will be a cycle of enabling one route at a time, and resolving issues with it.

For simple plugins, with one or two routes, this process may be fairly quick.

The primary task we repeat here goes like this:

-   Ensure that a route exists in `src/plugin/config.yml`
-   Ensure that this route is handled in `src/plugin/iframe_root/main.js`
-   Ensure that the widget which handles the route works correctly

Below we'll walk through the process of porting one route.

##### Ensure that a route exists

kbase-ui expects a plugins routing to be defined in the plugins top level `config.yml` file. Our current config.yml file is the one copied from kbase-ui-tools, and then lightly edited to replace "example" with our plugin name.

This is what our route definition should look like in `kbase-ui-plugin-PLUGIN/config.yml`:

```
routes:
  - path: ['PLUGIN']
    queryParams: {
    }
    params: {
      view: 'VIEW'
    }
    widget: kb_plugin_PLUGIN
    authorization: true
```

The routing mechanism is fairly simple. Each route has a path specification, which, when it matches an incoming or changed browser url, will invoke an associated widget with any detected parameters.

The basic route set up in the config.yml file installed from kbase-ui-tools matches the simple path 'PLUGIN' (where PLUGIN is of course your plugin name). In the browser this route would appear as the url `https://ci.kbase.us/#PLUGIN`.

##### Carry over settings from original route

You should open the original config.yml, located now in `kbase-ui-plugin-PLUGIN/src/plugin/iframe_root/modules/config.yml`. You will compare the configuration of the original route to the new one in `kbase-ui-plugin-PLUGIN/src/plugin/config.yml`. All of the settings should match, including path, queryParams, and authorization.

##### Authorization required?

A route may specify that authorization is required in order to load it. This allows kbase-ui to enforce a simple authorization gate on a plugin path. If kbase-ui detects that the browser is not authorized (no kbase token in the cookie kbase_session), it will enter the login auth flow automatically. At the end of successful authentication, kbase-ui will invoke the originally requested path.

##### Setting the view in config.yml

When a plugin operates inside of an iframe, a special "view" parameter is passed as a route parameter. This view parameter represents a simple mapping of string to widget. The view is defined in config.yml, and is handled by the main.js boot script inside iframe_root.

For a simple plugin with one route, it isn't really necessary to invoke this view mechanism. However, since it is already set up in the support files installed from kbase-ui-tools, it makes sense to implement it.

Set the view as the value of the `view` property. You may choose any value which makes sense for this view.

##### Setting the view in main.js

Inside the iframe, the `main.js` file is responsible for handling routing within the app. It will receive the `params.view` property and dispatch the matching widget, if any.

With an iframe-based plugin, the same routing file is required, but instead of each route leading to an individual widget, they all lead to the same one. This widget, supplied by kbase-ui-tools, is responsible simply for passing the routing information into the iframe for evaluation.

In addition, while the kbase-ui router operates on matching paths, path params, and query params, the iframe router operates on a simple view identifier (string).

Our job is to ensure that for each route originally defined in the original `config.yml` (as can be found in `iframe_root/modules/config.yml`) we create a new route which leads to our one widget.

We are going to conceptually copy the routes in `iframe_root/modules/config.yml` (which will not be used directly, it is just for reference to the configuration of the plugin) to views in the same file.

LEFT OFT HERE

The iframe based routing works best with a single point of entry. One route on the host side of the plugin catches everything sent to the top navigation path; the iframe side of the plugin receives this and does it’s own internal routing.

Some plugins cannot have a full movement of plugin functionality into an iframe; e.g. auth-client login/logout integration. In such cases, the plugin config may continue to support multiple routes. However, there will still be a single route which leads into the iframe.

This is enabled by the route syntax:

Capture the path after the initial element with a ‘rest’ parameter type
Capture all extra path elements (beyond what is defined) with captureExtraPath
Capture all extra search query params with captureExtraSearch

In iframe_root/main.js, you’ll need to set up routes:
Find the comment // Add routes here

Main.js routes work by dispatching on the second path element. The first was used by the ui (or rather the top level config.yml for this plugin) to dispatch to the plugin itself. The second element is used to dispatch on the “view”

If this is not possible, an outer route can set the view in queryParams as the literal param named ‘view’
queryParams:
path: {literal: [‘viewIdHere’]}

The widget module which is invoked by the view will receive the remainder of the path as a parameter named ‘rest’.

Reload the browser

The first time you get this working, things will probably be broken.
Look out for modules which don’t load. If the module being loaded is terribly obsolete, think about an easy way to refactor. For instance, kb_ko is an obsolete knockout wrapper, kb_knockout is better.

## Cleanup Tasks

Other than encountering issues and fixing them, here are some common issues:

-   [fix up ui links](#Fix_up_links)
-   replace usages of plugin special module
-   fix up styles

## Notes

Here are some various notes on porting issues:

### A note on routes.

TODO

<a name="fix_up_links"></a>

### Fix up links

Links formed like “#plugin/some/thing” will need to be rewritten as “/#/plugin/some/thing”. Since the plugin is located at an internal path within the ui, the initial “/” is required to ensure that the url starts at the root.

#### Tasks

search for internal ui links. E.g. "# or '#. When you find such links you may wish to narrow your search to specific links, e.g. #people, because there can be a lot of false positives

all such links need a / before the # to ensure the url is absolute

all such links need a target, either \_blank to open a new window (such links probably already have this) or \_parent otherwise.

### A note on reentrant top level widgets.

Widgets which utilize the “run” widget method may be run as a reentrant route. In such cases, if the route widget is already mounted and it is re-invoked on a change of route, the run method is called with the route params, rather than dismounting, mounting, etc.

This is faster for users, but you must make sure.

### A note on styles:

All classnames should be unique, to reduce the chance of conflicts

To accomplish this, namespace based on the plugin:

E.g. MyPlugin for the root (in index.html)

Simple plugins which just dump content into the node and expect it to scroll should set this in index.css on the root div (which should have a classname MyPlugin).

### Set up menu items.

Menu items are defined in top level config.yml

Menu items are enabled in the ui in kbase-ui config/app/dev/services.yml and config/app/prod/services.yml

After updating the ui services.yml files, you’ll need to rebuild the ui

```
make dev-start env=dev build=dev build-image=t plugins="PLUGIN"
```

When done, push to your fork (payoff branch)

Then PR to origin/upstream.

Then build the ui without local plugin override.

make dev-start env=dev build=dev build-image=t
You may need to force the image rebuilding by deleting the image; we’ve made no changes to kbase-ui so an image rebuild will not necessarily be triggered.

I will often just delete the docker disk image - this is necessary to do on mac anyway, on occasion.

The first pass on this plugin is done

### A note about runtime usage

Some old old code uses early versions of config and service, e.g. getConfig, getService, not to mention getKbaseSession!
Links from a plugin to itself or to other plugins (hash routes without kbase-ui) need to be handled somewhat specially, and may require porting:

A ui navigation url begins with /#PLUGIN:

The initial / ensures that the hash is rooted at the url root for the ui. Many plugins use # without the leading /. Since a plugin operates on a path (not at the root), such urls will be treated as relative to the plugin.

The link includes the target attribute set to “\_parent” (unless “\_blank” is already used). This forces the browser to send the navigation request to the ui and not to the iframe.

Urls which are set directly on the window (window.location.href = “#blah”) may be okay; the kbase-ui integration code catches changes the hashchange and forwards them to the ui through the communication channel.
TODO: Verify that this works well.

### converting usages of kb_plugin_PLUGIN

kbase-ui provided a special module for each plugin named "kb_plugin_PLUGIN" (where PLUGIN is the plugin name). This module was used for accessing the path of the plugin within the ui codebase.

This has been replaced with the runtime properties named: `runtime.pluginPath`, which stores the root path for the plugin, and `runtime.pluginResourcePath`, which stores the path of the resources directory within the plugin.

This property is typically used to create a path to a resource contained within the plugin which is cannot be loaded as an AMD module. E.g. images, data files which are not json or yaml.

Solution: search the codebase for usages of `kb\_plugin\_`, which is usually mapped to the receiving variable Plugin.

Remove this module from the define function.

Replace useages of `Plugin.plugin.fullPath` with `runtime.pluginResourcePath` (most common), or `Plugin.plugin.path` with `runtime.pluginPath`.

> Tip: when searching the plugin codebase, exclude the `vendor` directory.
