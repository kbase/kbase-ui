# Widgets

- What is a Widget?
- Widget API

## What is a Widget?

From [webopedia.com](https://webopedia.com):

> *Widget is a generic term for the part of a GUI that allows the user to 
interface with the application and operating system.*

This is not quite accurate or relevant for KBase widgets. Our widgets are indeed
interfaces to the application, but not the operating system (per se), and
includes many other services. 

How about wikipedia?

> *In computing, a web widget is a software widget for the web. It's a small 
application with limited functionality that can be installed and 
executed within a web page by an end user.*

This is almost there. 

Lets try our own:

> *A widget is an web browser component, consisting of code, markup, styles, 
configuration, and data, which displays a view of data within a defined area
of the web page. It may provide user interactivity.*

At KBase widgets are used for the following applications:

- display of data objects from user Narratives
- display of data objects from global Narratives
- layout of the user interface
- user interface elements (menu, titlebar, etc.)
- user interface pages: login, error
- dashboard and related widgets
- user profile page and related widgets



## Widget API

### Core Widget API

The Widget API is multilayered. 

The core API, called the Widget Lifecycle API, is the lowest level of widget implementation. It essentially implements a service interface, meaning that is provides for the creation of, execution of, and disposal of objects. It is used for composing and managing widgets in a general way.

The api is implemented by producing an object which contains a valid subset of the methods described below. 

This api is very small, by design, and most of the interface methods are optional. Each method is designed to implement a single type of functionality. For many widgets it would be possible to utilize just a few methods.


#### creation

*arguments*: config - a configuration object required by the widget to create and/or initialize itself

*required*: yes

This is not a method. A widget is created by some process; Javascript offers multiple pathways to object creation. Realistically, though, a widget is embodied as the product of a module, and the module exposes a factory object with one method "make". In any case, the "creation" process accepts a configuration object which is used to create the widget.

#### init

*arguments*: config - a configuration object required by the widget to create and/or initialize itself

*required*: no

In some contexts, it may be necessary to decouple creation from initialization. The ```init``` method provides a simliar function to creation, for example allocation resources, initializing data structures.

#### attach

*arguments*: node - a DOM node

*required*: yes

All widgets, by definition, are linked to a location within a web page which is represented as a "DOM node". This method provides the opportunity to link a widget to that location. It is also a very good place to create and install a layout at the dom node.

A very common use case is to create a dom node locally and attach it to the provided node, so that any events or sub-nodes added to it can be automatically removed by the DOM during the "detach" method.

#### start

*arguments*: params - the run time parameters to the widget; e.g. the url route parameters.

*required*: no

This is one of the methods dedicated to the service lifecycle. A widget will enter an "activation state", after which it has subscribed to any events, set up DOM event listeners, can assume that it has a layout installed with dom nodes at known locations.

Because this method receives the runtime parameters (params), it can take appropriate action to react to the input. E.g. it may recieve inputs for fetching and rendering data.

The "stop" method is the partner to this method.

#### run

*arguments*: params -  the run time parameters to the widget; e.g. the url route parameters.

*required*: no

Similar to "start", this method is designed to react to input in the form of the params object. The canonical use case is to receive input from the url, path components and query variables, and take appropriate action.

This method may be invoked multiple times during the lifetime of the widget. 

#### stop

*arguments*: none

*required*: no

The sister method to "start", the stop method provides an opportuntity for the widget to tear down any mechanisms set up during the start method. A common use is to unsubscribe from event subscriptions or cancel timers.

Note that any DOM related even handlers set by the widget will be automatically removed if the "proxy node" pattern is utilized.

#### detach

*arguments*: none

*required*: no

This is the sister method to "attach", allowing the widget to remove any DOM structures or services installed during the attach method.

For example, it is common to create a local node (only known to this widget) directly underneath the node supplied in the attach method. If so, the detach method is the place to remove them.


#### destroy

*arguments*: none

*required*: no

Seldom used, this provides the counterpoint to widget creation and initialization. If there are global resources requested by this widget, this is the place to remove them. 


### An example widget using the core api

It is perfectly reasonable to build widgets using the core api. In fact, during development of this generation of the kbase ui, most new widgets were implemented directly in the core api.

### Operating on Widgets


### Widget Types

Although it is reasonable, feasible and sometimes necessary to implement a widget using the core widget api. 

However, it does require a fair amount of knowledge of the ui system and mechanics.

This is problematic for several reasons:

*It binds the widget to core artifacts of the ui system*

We have worked hard to remove hard-coded dependencies to filesystem layout, urls, and specifically named object properties, but have replaced that with a single runtime object dependency. It would be better not to have that dependency as well.

*It binds the widget to the core api*

The core widget api is designed to provide for sensible widget lifecycle management. However, this is an "implementation detail", and the requirements may change (indeed we have some on the horizon). Binding directly to the core widget api creates dependencies on system construction.

To deal with these issues we offer a set of pre-built widget objects which allow the construction of widgets meeting the core api requirements, yet also removing these code dependencies. These "higher level" widget objects also capture common use cases of widget applications.

- standardWidget
- dataWidget

### data Widget

- recv
- send
- getConfig
- hasConfig
- getState
- setState
- hasState
- get
- set
- addDomEvent
- attachDomEvent
- setTitle
- runtime

The data widget is dedicated to serving the needs of data visualization applications. 

#### recv




## Legacy Widgets

## Design Patterns

### Get configuration 

### Get current authentication

### Subscribe to system or service events

### Set up an observer

### One widget to rule others

### Handling Errors

### Debugging

