# Creating a new widget repo

How to create a new widget repo, get it started, and incorporate it into the kbase ui:

## Create a development directory

This directory will contain the *kbase-ui* repo which will host your new plugin, and your new plugin repo in which you will be developing your plugin. The eventual structure will look something like this:

```
dev
  kbase-ui
  kbase-ui-plugin-myplugin
```

For now, just create the ```dev``` (or whatever you want to call it) wherever you want to.

## Ensure you are set up for Javascript development

If your machine is not set up for javascript development, you may need to install some prerequisites. If so, please refer to the [developer set up docs].

## Fork kbase-ui and clone it

In order to incorporate a plugin into kbase-ui, small changes are required to be made to two configuration files. In order to incorporate these changes into kbase-ui, you will need to submit a PR from your fork. To support this, you might as well fork kbase-ui and use that fork to develop the plugin with.

Within the dev directory

```
git clone -b develop https://github.com/youraccount/kbase-ui
```

## Do a quick sanity test

Within the kbase-ui repo, issue build kbase-ui and load it via the local developer server:

```
cd kbase-ui
make init
make build
make start
make preview
```

If all went well, you should see the kbase ui pop up in your default browser.


## Create Directories and Skeleton Files

Within the dev directory, create a directory on this naming pattern, this will become the repo name as well: ```kbase-ui-plugin-myplugin``` where *myplugin* is the plugin name.

create the initial core files:

```
mkdir src
vi README.md
# My Plugin

THis is my plugin!

npm init


Eriks-MBP:kbase-ui-plugin-datawidgets erik$ npm init
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help json` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg> --save` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
name: (kbase-ui-plugin-datawidgets)
version: (1.0.0) 0.0.1
description: New data widgets for KBase
entry point: (index.js)
test command:
git repository:
keywords:
author: KBase
license: (ISC) SEE LICENSE IN LICENSE.md
About to write to /Users/erik/work/kbase/sprints/kbase-ui/repos/kbase-ui-plugin-datawidgets/package.json:

{
  "name": "kbase-ui-plugin-datawidgets",
  "version": "0.0.1",
  "description": "New data widgets for KBase",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "KBase",
  "license": "SEE LICENSE IN LICENSE.md"
}


Is this ok? (yes) yes
```

Copy the KBase license file [ref] into the LICENSE.md file.

Make the rest of the directories like this

```
src
   plugin
     modules
     resources
     config.yml
```

The basic config file is as follows.

Note that this one contains references to files which don't exist yet! We'll add them

```
## Welcome Panel
---
package:
    name: myplugin
    description: A description of the plugin
    author: Your Name (or KBase?)
    date: April 1, 2015
    version: 0.0.1
source:
    modules:
        -
            module: kb_myplugin_panel
            file: panel
install:
    widgets:
        - 
            module: kb_myplugin_panel
            id: kb_myplugin_panel
            type: factory
    # Set up a route to install that widget in the main body view
    routes:
        -
            path: ['test']
            widget: test
    # Set up a menu item to invoke the path above
    menu:
        -
            name: test
            definition:
                path: test
                label: Test!
                icon: smile-o
               
```

This plugin will not yet work. We first need to add the missing files.

You should replace any instance of myplugin with the name of your plugin.

You are now ready to open up the repo in your favorite IDE and start hacking.

### Create a simple panel

We will first get signs of life from our plugin by setting up a single panel widget, a route, and a menu item. This will be enough to let us know that we have built the foundation. Although the panel will not be used in the production web app, it is handy to have one set up in a development mode since it lets you display arbitrary widgets with arbitrary data.

A panel widget is simply a widget which is specialized for displaying other widgets. Our first crack at the panel widget will not include any of the sub-widget stuff.

#### Create the widget file

In ```src/plugin/modules``` create the file ```panel.js```.

I start every new file with this skeleton:

```
/*global define*/
/*jslint white: true, browser: true*/
define([
    
], function () {
});
```

This establishes:

- jslint configuration comments. These identify exceptions to the strict checking of jslint. All we accept by default is the global *define* for requirejs module definition, *browser: true* to turn on some restrictions and turn off others, and *white: true* because the whining about extra spaces truly annoying. See [http://jslint.com/help.html](http://jslint.com/help.html).
- the AMD framework, using *define* as provided by requirejs. The environment (web page) which invokes this widget must already have loaded requirejs globally.
- javascript strict mode

#### Create a very simple widget. 

We'll first create a widget using the core widget api.

```
/*global define*/
/*jslint white: true, browser: true*/
define([    
], function () {
    
    function factory(config) {
        var root, container;
        function attach(node) {
            root = node;
            container = node.appendChild(document.createElement('div'));
        }
        function run(params) {
            container.innerHTML = 'Hello, I\'m a Panel';
        }
        function detach() {
            root.removeChild(container);
        }
        
        return Object.freeze({
            attach: attach,
            run: run,
            detach: detach
        });
    }
    
    return Object.freeze({
        make: function (config) {
            return factory(config);
        }
    });
});
```


#### Push up to an online git repository

That is, github. We will mimic the entire process of integrating a plugin into the kbase ui. Plugins are generally either integrated into the kbase ui itself (*built-ins*) or pulled down from github, either raw or through bower. In this tutorial, we will first integrate the plugin through github, and later set up a special developer workflow which simply makes the development cycle faster. (There may be ways of automating the github workflow, but it will always be slower by some number of seconds.)

- create the empty repo at github. Github will present you with instructions for pushing a new repo from the command line. This is what we will be doing.
- back in the dev/kbase-ui-plugin-myplugin directory, issue the following commands:

```
git init
git add -A
git commit -m "Initial commit of this new plugin"
git remote add origin https://github.com/you/kbase-ui-plugin-myplugin.git
git push -u origin master
```


#### Hook this into the kbase ui

Now we want to load this up into the kbase ui.

All of the file references below are relative to ```dev/kbase-ui```.


##### 1) Add the vis widget demo plugin as a *bower dependency*

Adding the plugin to the bower config file will ensure that it will be installed into the kbase-ui. Bower can install a package directly from a github repo, and in fact has a special short-hand format for doing so. Although in the future we will utilize the bower central catalog to take full advantage of semantic versioning and simplified configuration, for now we are installing directly from github.

Within the kbase-ui repo, locate the bower configuration file ```bower.json```. 

```
dev/kbase-ui/bower.json
```

In the dependencies section, place this line:
        
```
"kbase-ui-plugin-myplugin": "you/kbase-ui-plugin-myplugin#master",
```

Notes:    
    - the ```#master``` suffix indicates the git branch to fetch from. By indicating a branch, bower will also track the most recent commit, and will update the local package if the branch is updated.
        
#####  3) Update the *grunt build script* to include the plugin in the build

In the kbase-ui repo, edit the grunt configuration file ```Gruntfile.js```.

```
dev/kbase-ui/Gruntfile.js
```


Locate the ```bowerFiles``` object, and insert or append the following item:

```
{
    name: 'kbase-ui-plugin-mywidget',
    cwd: 'src/plugin',
    src: ['**/*']
}
```

This will ensure that the demo repo is copied during the build task.

##### 4) Next we need to ensure that our build process will target the *test* ui configuration.

The ui contains three sets of configuration files. One of these config sets controls the set of plugins loaded into the runtime, as well as the menu items. By switching to the test configuration we can freely add the new plugins and menu items.

In the ```Gruntfile.js``` from above, locate the *uiTarget* variable and make sure the value is ```test```.

```
uiTarget = 'test';
```

##### 5) Update the test ui config to load the plugin

The ui config files are located in the top level config directory, and are named ```ui-test.yml``` and ```ui-prod.yml```. 

```
dev/kbase-ui/config/ui-prod.yml
dev/kbase-ui/config/ui-test.yml
```

The *uiTarget* value is used to locate the required config file, thus *test* and *prod*. We are interested in using the test config file.

The config files are in the YAML format. The file has two top-level properties -- *plugins* and *menu*. The *plugins* section specifies the plugins to load into the runtime, and the *menu* section defines the composition of the main (hamburger) menu.

The plugin sections is currently composed of a list of lists. The first list level defines sets of plugins which are loaded in order. The second list level specifies the actual lists of plugins and are loaded in arbitrary order. The first level is ordered because presently there are dependencies between plugins, and the ordering ensures that core plugins are loaded first.Normally we just worry about putting items into the second group.

In order for our plugin to load into the ui runtime, we need to provide an appropriate entry. These entries take two forms. The simple form is a string which specifies a directory within ```kbase-ui/src/plugins```. These are internal plugins. We want to create an entry the second form.

Insert or append this item into the second group of plugins:

```
        -
            name: myplugin
            directory: bower_components/kbase-ui-plugin-myplugin
```

This one instructs the ui to look for the plugin in the specified path relative to the build directory.

Note: Thisi being yaml, be sure that the indentation is correct.

##### 6) Update the test ui config to use the *menu items*.

The plugin configuration may register menu items in the runtime, but does not install them on the menu. In order for an available menu item to appear, it needs to be added to the appropriate location in ```ui-test.yml```. 

There are two menus -- authenticated and unauthenticated. If a kbase token is present, the authenticated menu is displayed. You may use either or both menus for testing. In addition, each menu has three sections -- main, developer, and help. It is best to place testing menu entries like these into the development section.

In the demo plugin, the ```config.yml``` file contains a section specifying menu items to be added to the system. The *name* property is what we will add to the ui config in order to have them appear in the main menu.

Back in ```ui-test.yml```, we will be editing the *menu* section. We will simply be adding each of the menu names we find in the plugin config to the developer menu array for either or both of the authenticated and unauthenticated menus.

In our case, there is just one menu item: test

This is how the default menu will look after adding the four demo menu items.

> ```
        menus:
            authenticated: 
                main: [narrative, search, dashboard]
                developer: [databrowser, typebrowser, test]
                help: [about-kbase, contact-kbase]
            unauthenticated: 
                main: [search]
                help: [about-kbase, contact-kbase]
> ```

##### 7) Build and inspect

If all went well, you should be able to build the ui and inspect it with a browser. Below are the "manual" steps:

- in the top level of the repo, fetch the npm packages:

        npm install

- Next build ui runtime

        grunt build

- Now to view the web app:

        grunt preview

The grunt preview can be a bit wonky. It will start a mini-web server with the build/client directory as the root, and then open up the system default web browser pointed there. I've found that if that browser is Safari, and Safari is already open, the load may fail. Closing Safari and then reissuing ```grunt preview``` leads to success. (I don't know about other browser.)

In my normal developer flow (on Netbeans) I utilize the built-in server.


## Add a new widget

Now that we have a panel that can do at least *something*, let's have it show another widget. After all, the purpose of the panel is to act as the glue between a route, a request, and the widgets.

### add a widget manager, widgetSet

A panel can create and display sub-widgets all by itself, but it is tedious. It is important for someone to know how to do this, but not for most widget development. It is very handy to be able to put together a basic panel, because it is the best way to develop and test widgets.

So, let's get started!

The primary tool for dealing with widgets is a device called the *WidgetSet*. A widget set is actually a fairly straightforward widget which has methods adding new widgets. The widget can be operated just like a regular widget, but as it is invoked, it also invokes all of the widgets that it has been asked to create.

#### Add the widgetset dependency and create one

```
   define([
1)       'kb_common_widgetSet'
2)   ], function (WidgetSet) {
         'use strict';
    
       function factory(config) {
3)         var root, container, runtime = config.runtime,
4)             widgetSet = WidgetSet.make({runtime: runtime});
```

1) We add the module name for the widgetSet, ```kb_common_widgetSet```

2) For each module there is a matching function argument.

3) every widget receives a runtime argument property. This is necesary for interacting with the runtime system. It is handy to store it as a local variable for usage throughout the widget implementation

4) We construct a widget set just like a widget -- it is a factory, and at a minimum receives the runtime argument property.


#### Complete the panel widget api implementation

A widget which takes on the responsibilty of managing other widgets must implement the entire widget lifecycle api. This is becuase it must reflect each stage of the lifecycle into the widgetSet, which in turn may invoke the widgets. The widgetSet takes care of that, but our panel widget must invoke the widgetSet at the appropriate times.


```
        function init(config) {
            return widgetSet.init(config);
        }
        
        function attach(node) {
            root = node;
            container = node.appendChild(document.createElement('div'));
            return widgetSet.attach(container);
        }
        function start(params) {
            return widgetSet.start(params);
        }
        function run(params) {
            container.innerHTML = 'Hello, I\'m a Panel';
            return widgetSet.run(params);
        }
        function stop() {
            return widgetSet.stop();
        }
        function detach() {
            root.removeChild(container);
            return widgetSet.detach();
        }
        function destroy() {
            return widgetSet.destroy();
        }
        
        return {
            init: init,
            attach: attach,
            start: start,
            run: run,
            stop: stop,
            detach: detach,
            destroy: destroy
        };
    }
```

We have added the init, start, stop, and destroy functions, and placed them into the object returned by the factory. We have also added the widgetSet invocations within each method. Note that the widgetSet simply invokes the same method as it is embedded in.

Now, as it stands, this panel will not do anything different!

As a quick check, lets walk through the process of updating the repo, our local kbase-ui instalation, and rebuilding.

- after you've made the above changes to kbase-ui, commit the chages with git. While in the plugin repo issue 

```
git add -A
git commit
Add widgetSet, and complete the widget api interface.
git push origin
```

- in the kbase-ui repo, update the bower dependencies, which will pull down the changes to the plugin that you just pushed up:

```
bower update
```

- rebuild the kbase-ui

```
grunt build
```

- and preview it

```
grunt preview
```

- navigate to the test menu item. It should work, but it doesn't do anything different! This is because the only interaction with the dom is still intact, and the widgetSet actually does no meaningful work, because no widgets have been added to it. 


#### Add a rendering function

When composing multiple windows into a parent widget, the parent widget is responsible for creating a DOM area in which to place the widgets. The parent widget can have other responsibilities, but that is beyond the scope of this tutorial.

A good pattern for creating layout is to have a dedicated function to create the layout markup, and insert it into the DOM within the attach method. At this time we'll also get familiar with the html utility, which contains handy methods for creating markup in a functional style.

So lets add a rendering function:

- add a new dependency for the html utility module. This module helps us write functional markup. This is very useful because it allows you to use javascript language tools to ensure the integrity of your markup, and to compose markup generation using standard javascript language expressions.

Here is how we include the dependency:

```
   define([
       'kb_widget_widgetSet',
1)     'kb_common_html',
2)     'bootstrap'
3) ], function (WidgetSet, html) {
```

If you are new to AMD, this will help cement the understanding. We first add the new module id to the first argument to ```define```, and then we add the matching argument to the argument list to the function which is the second argument to *define*.

The module id must match the module definition in either the ```require-config.js``` for the web app [ref] or the module source.module stanza in a plugin config ```config.yml```.

The second dependency we have added is *bootstrap*, the popular css and javascript framework. Bootstrap is used extensively within KBase, so we might as well take advantage of it for creating a more useful layout. Note that we do not have a matching argument for the bootstrap module. This is because bootstrap is loaded for effect -- the css is added to the window, and the javascript is added to the jquery global environment. Note as well that we did not need to include the bootstrap css nor jquery as dependencies. They are implicitly loaded into the page through the app-wide require-config, but are not available directly within this module.



- Write a render function.

```
  function factory(config) {
        var root, container, runtime = config.runtime,
            widgetSet = WidgetSet.make({runtime: runtime}),
            layout;

        function render() {
            var div = html.tag('div'),
                p = html.tag('p');
            return div({class: 'container-fluid'}, [
                p('Hi, I am still a panel, but becoming more sophisticated!'),
                p('Below you can find the widgets'),
                div({class: 'row'}, [
                    div({class: 'col-md-3'}, 'Sorry, nothing here yet'),
                    div({class: 'col-md-3'}, 'Sorry, nothing here yet'),
                    div({class: 'col-md-3'}, 'Sorry, nothing here yet')                    
                ])
            ]);
        }

        render = layout();
```

The only restriction on our render function is that it return a string of valid HTML 5 markup.

  - Each tag to be used is first created as a local variable by calling html.tag('TAG'), where TAG is the one you want to use
    - tag functions are cached in the module for performance
  - A tag signature is ```tag(attrib, content)```, where ```attrib``` is an object in which each property is an attribute, and ```content``` is either a string or an array of strings. Both arguments are optional.
  - A tag simply emits a string.
  - the class attributes depend on *bootstrap* version 3 having been loaded into the window.

- Finally, insert the results of ```render()``` into the DOM.

```
        function run(params) {
            runtime.send('ui', 'setTitle', 'Hi, I am the data widgets plugin');
            container.innerHTML = render();
            return widgetSet.run(params);
        }
```




#### create the widget file

So far, we have a single widget which we have dubbed a *panel*, claiming that it willb e used to coordinate sets of sub-widgets. We have added the *widgetSet* to invoke those sub-widgets, and a render function with placeholders for where they will appear.

Now we will create some widgets to appear there. 

We have also chewed up a lot of bytes to get here. That was primarily to demonstrate the underpinnings for the widget framework, the widget lifecycle interface or api. When constructing data or other widgets we will use an api that is built upon this, but is much simpler to get started with.

So, withot further ado, let us jump into the *dataWidget*.

- First, create the file ```widget.js``` within the plugin module directory

- add the same boilerplate we used for the panel widget:

```
/*global define*/
/*jslint white:true,browser:true*/
define([
], function () {
});
```

- Now we will add the dependency for the *dataWidget*, and create a simple *factory* function.

```
define([
    'kb_widget_dataWdiget'
], function (DataWidget) {
    
    function factory(config) {
        return DataWidget({
            runtime: config.runtime,
            on: {
                render: function () {
                    return 'Hi, I am a widget';
                }
            }
        });
    }
    
    return {
        make: factory
    }; 
```

We haven't hooked into the data access features yet, we just want to get an "Hello World" to work first.

##### dataWidget

The dataWidget is a widget api built on top of the widget lifecycle api. It is dedicated to providing a stable and straightforward access to UI services and Data services. It would be perfectly possible to create widgets with a combination of the lifecycyel api, direct access to the UI, direct access to the data service libraries, and a combination of other convenience modules.

##### Factory pattern

The factory pattern is one of the dominant object production patterns in javascript. It is preferred by some because of its simplicity, lack of inheritance, and usage of the closure properties of functions to provide security and also broad development support.

- Configure the widget into the plugin

Just creating the widget file does not make it available to the plugin, the panel or any part of the ui. The widget is made available adding it into the plugin configuration file *config.yml'.

First add the module to the source.modules section:

```
        -
            modle: kb_datawidgets_widget
            file: widget
```

THen add the widget to the install.widgets section:

```
        -
            modle: kb_datawidgets_widget
            id: kb_datawidgets_widget
            type: factory
```

Note to self: we should perhaps work on simplifying this...


- Hook the widget into the panel!

Now we just need one chage to the panel in order to make the widget appear there:


```
    div({class: 'row'}, [
1)                     div({class: 'col-md-3', id: widgetSet.addWidget('kb_myplugin_widget')}),
                       div({class: 'col-md-3'}, 'Sorry, nothing here yet'),
                       div({class: 'col-md-3'}, 'Sorry, nothing here yet')                    
                   ])
```

At (1) we have added the id attribute, and set it to the value of ```widgetSet.addWidget('kb_myplugin_widget')```. This expression invokes the makeWidget method of widgetSet, which receives the name of the widget to be created. Each widget created by widgetSet is configured with an id (which in turn is generated by the html module). This id is unique across all elements generated by the UI, and is used to set the id for the element into which the widget will be rendered. It is "glue" between the DOM and our code.


#### Run the widget set


### create a simple widget



### now let's connect them


