---
---
# Updating `kbase-ui`

Before updating kbase-ui, you should have a grasp on the [basic architectural concepts](/architecture).

To briefly summarize:

- kbase-ui is a web app composed of a few html pages, several css files, a configuration file, and many javascript files.
- the primary entry point is `index.html`, which is responsible for:
    - default error handling
    - browser compatibility checking
    - loading base stylesheets
    - loading the AMD manager requirejs
    - loading the initial entrypoint Javascript file
- code is organized with AMD, and loaded with requirejs
- code is ES6 compliant
- kbase-ui is run behind an nginx server
- development of kbase-ui is conducted behind an nginx proxy
- ui services provide runtime capabilities
- plugins provide most of the user facing functionality

With that out of the way, let us proceed!

## Overview

The basic workflow for kbase-ui development is the venerable iterative cycle:

1. edit code
2. reload browser
3. if done, exit
4. goto 1

Since kbase-ui is based on directly loading JS modules as Asynchronous Module Definition (AMD) compatible files, there is no compilation cycle (for development -- there is for prod.)

We don't have any fancy auto-reload code loaded during development, so it it is simply modifying code, and then reloading.

## Build kbase-ui once

Before starting a kbase-ui editing session, you need to conduct an initial kbase-ui build.

If you have followed the [quick start](/getting-started/quick-start) you should be good to go.

It is advisable to use a local cert, as mentioned in that document. 

It would be pertinent to note here that this is a "development build" of kbase-ui. The development build uses plain, unminified javascript files. This allows for a direct 1-1 relationship between files loaded in the browser and files you are editing.

The production build both minifies files, and assemble them into a custom type of bundle. This reduces the overall load size, increases responsiveness the first time a view is loaded (because the files are resident already), and increases reliability (since each module is not network-loaded).

## Run kbase-ui with live directories

If kbase-ui is currently running, exit it (from the terminal, or with docker.)

We will now start it up again, but this time overlaying the 

## The Cycle

## Updating dependencies

## Final build

## Run integration tests

## Prepare PR

## Merge PR

## Deploy on CI