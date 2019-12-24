# KBase UI - Architecture

## Contents

- Introduction
- Architecture principles
- Chronological loading and execution sequence
- User Interaction
- Application Components
- Software Design Topics
    - Asynchrony
    - Promises
    - Modules / AMD / RequreJS
    - Incompatible frameworks
    - Technology class and choosing an implementation
    - Configuration
    - Common data formats
    - Exception handling
    - Exceptional presentation to users
    - Logging and Reporting
    - Cross window communication
    - Shared state
    - Messaging
    - Widget coordination / communication
    - Templating


## Introduction

The KBase UI is consists of the following major components:

- front end interface for all display and user tools
- back end supplies data from kbase services
- web server provides resources over http as needed

## Chronological loading and execution sequence

1. browser contacts kbase-ui host

2. simple web server (nginx by default) serves index.html from the kbase-ui root

3. index.html instructs the browser to load the core capabilities javascript: requirejs and the require configuration file. Requirejs and the associated configuration file form the framework for the application. All modules, other than plugins, are registered in the configuration file.

4. index.html loads and starts the "main" application

5. The "main" application loads 
    - the web application module, 
    - the ui configuration, 
    - stylesheets for global styles:
        - bootstrap
        - font awesome
        - kbase specializations of the above
        - kbase own styles

6. When all dependencies are loaded, application is "run".

7. The "app" is really quite lightweight, and essentially acts to run a set of task sequences, each of which may be asynchronous in nature, and to kick off the initial widget.
    - load services
    - install plugins
    - start services
    - install the user interface plugin
    - invoke the initial default route

8. After this the application is driven by the user's actions

## User interaction

Since the kbase-ui is primarily a display platform, most user interaction is oriented towards navigation. The kbase-ui implementsa simple router which captures link clicks, looks for a matching registered route, and ultimately loads and runs a widget in the main body area.

At this time, there is no framework for user interaction within and between widgets. A widget may utilize dom events, jquery, d3 or any other method to capture user interaction and perform changes on the widget.

There is a small set of global events which may be emitted by any code. These events include logging out and navigating.

## Application Components

Other than the initial set of files (index.html, main.js, app.js) most capability in the system is provided by the following sets of components:

Third party packages
: The kbase-ui relies on over 30 javascript and css packages, from jquery to numeric, to provide enhanced capabilities.

Internal support packages
: KBase maintains a sizable collection of modules to support code reuse and design patterns.

App Services
: These are specialized "glue code" to provide run time services to the kbase-ui. Primary users of app services are widets which need to access some global or dynamic resource or set of methods

Plugin Packages
: Most of the body of kbase-us is provided in the form of "plugins", an isolated collection of code, styles, data, and configuration which can be loaded dynamically into the application. A core set of plugins reside in the kbase-ui codebase, with some larger plugins (dashboard, dataview, etc.) residing in separate repositories and pulled into the project at build time.

Widgets
: Widgets are the unit of composition for the display aspect of the kbase-ui. The user interface is composed of widgets from the menu to the most detailed data visualization.

