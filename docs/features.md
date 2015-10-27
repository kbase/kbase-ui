# KBase UI Features

## Core Technologies

- AMD - Asynchronous Module Definition
- Strict coding standards
- Plugins
- Widgets
- Routing
- Messaging
- Observer
- Logging
- Services

### AMD and RequireJS

One of the main reasons to refactor the Kbase UI was to move all dependency loading from synchronous and order-dependent file load statements embedded in the primary index.html file, to an AMD system implemented by ReuquireJS. In an AMD system all javascript dependencies are loaded asynchronously in a highly structured manner. In combination with strict mode and code quality control with jslint, a more stable javscript environment is created. For instance, global variables can easily be identified and eliminated.

The AMD system is not perfect, but it provides some very tangible benefits:

- uniform and well-structured code modules
- single location for module names (require-config)
- well-known module life-cycles
- AMD loading of resources as well as code (json, yml, css)

In addition, AMD modules can be manipulated programmatically. Typically, a web app using AMD will define modules within a single javascript file, typically named require-config. This file sets up basic configuration for requirejs, as well as a mapping of module names to javascript files. However, it is also possible to define AMD modules at any time, in any code. Although this is not a recommended practice in general, it can be very useful when used with discipline. Thus, the plugin system is used to allow independence code packages to define modules which can be made available to the whole system.

At the same time, this practice points out a weakness of AMD -- module names are global. Therefore, module naming must follow some conventions To whit: 

- commonly used open source modules use simple, top-level names. E.g. jquery, bootstrap, underscore, etc. This is very important because when two more more modules are used together, and each has dependencies upon a common module, there needs to be an agreement upon the name of the common module.
- within kbase modules, we have (and will be ironing out kinks in) a namespacing practice: org_package_group_module. So, for example, kb_common_html corresponds to kbase, the kbase-common-js package, and the html module; or kb_dataview_modeling_fba, refers to kbase, the dataview (landing page) package, the modeling group of widgets, and the fba module (which defines the FBA widget).

### Coding Standards

Usage of AMD by itself enforces a type of coding standard. However, to ensure a more stable and maintainable codebase, we have introduced further measures.

#### strict mode

The usage of ```'use strict';``` at the top of module functions forces compliant browsers to enter "strict mode" for interpretation and compilation of javascript code. This eliminates some common bugs, such as accidental introduction of global variables, exposes some "silent bugs" by having the produce errors rather than silently being ignored (e.g. duplicate arguments), and creates more secure code, locking down some system-level properties (such as arguments.callee).

#### JS Lint

JS lint is a fairly strict code quality tool. It encourages better code organization and formatting, and discourages unsafe or ambiguous coding practices. Adherence to JS Lint, with some exceptions, leads to much clearer and maintainable code. It may be annoying at first, but js lint will be part of the required toolchain for code acceptance (including building and ci testing). 

It is much easier to work with JS Lint if your development tool supports it. E.g. some editors with integrated JS Lint support will show markers with tooltips when a problem is detected.

### Plugins

One of the most important new features of the KBase UI is the plugin system. A "plugin" is a bundle of code and resources that is loaded by and integrated into the KBase UI at runtime.

A plugin consists of a set of files under a single directory, and is loaded into the runtime through an entry in the primary web application loading script. The plugin directory structure is roughly

- plugin
    - config.yml
    - modules
        - module1.js
        - module2.js
    - resources
        - css
            - style1.css
        - images
            - image1.jpg
        - data
            - file1.json
            - file2.yml

At the heart of a plugin is a configuration file. This file, named ```config.yml``` is located in the root of the plugin. The config file contains all of the instructions for loading the plugin resources. All other files within the plugin represent resources to be loaded.

Sample config file

```

```

How does it compare to a ...

module? An AMD module is indeed executed at runtime, but does not bear any specific relation to the Kbase UI (although a set of co-loaded modules can be used to comprise services for the runtime, as was done in an earlier version.) Rather, at the heart of a plugin is a configuration file which instructs the plugin manager to load specific resources into the current runtime.

### Widgets

Of course, at the heart of the KBase UI are the widgets. Or rather, the first set of clients we serve are the Widgets. 

Widgets come in several types:

- Main Window - this is the main widget that is invoked with the ui is started. It is a controlling widget, and starts up and manages the following widgets:
    - hamburger menu
    - title
    - buttons
    - notifications
    - login
    - body

- Panel widgets - invoked when a route is encountered. The panel widget is mounted by the Main Window's Body Widget. A panel widget invariably displays one or more sub-widgets. It doesn't have to. It may just show its own content and be done with it.

- UI widgets - the ui employs a set of widgets to help with standard features, such as error display, page not found, about, help.

- UI plugins and widgets - There is a set of widgets closely allied to the UI, which are not strictly part of the UI codebase. These include:
    - user profile
    - dashboard

- Type viewers - 

- Data Viewers - 

## Developer 

- Building
- Testing


