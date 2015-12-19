# KBase UI Application Services

## Overview

## Architecture

## Services in the UI

### Heartbeat 

The heartbeat service is essentially a timer which issues period messages into the message bus. Widgets or other components may subscribe to the heartbeat message in order to provide timer based services without directly using DOM based window timers.

#### Configuration

- runtime
- interval

#### Methods

none
 
#### Events

- channel: heartbeat
- message: beat
- data: 
    - beats = the number of beat messages issued, an integer

> ```
{
    beats: <number>
}
```

### Menu

The menu service provides an abstract service for providing menu items to the system. It maintains a set of menu item definitions, a set of possible menu configurations, and the current menu.

Menu items are accepted primary through the pluginHandler interface, in which plugins request the addition of menu items through the plugin configuration.

The menu service has a concept of ordered sets of menu items. Each set is a "menu", and may be rendered by a widget which knows how to render them.

Currently there are two menus, authenticated and unauthenticated. 

#### Configuration

- runtime

#### Methods

- getCurrentMenu - returns the current menu, an array of menu items accepted by the menu manager.
- onChange - 

#### Events

##### publishes

none

##### subscribes to

**session:loggedin**

channel: session  
message: loggedin  
data: none  

Published when the the session service 

**session:loggedout**

channel: session  
message: loggedout

Published when the session service removes authentication from the app.


### Route

### Session

### Widget

### Service

### Data
