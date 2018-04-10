# Integration Testing

## Prerequisites

To get the most out of this document, you should be famliar with setting up kbase-ui locally for development and/or previewing. See [Getting Started](../dev/getting-started.md).

## Overview

At present, the focus of all testing in kbase-ui is integration testing. It gives the most bang for the buck, exercising not only multiple libraries, but plugins, configuration, and building too.

The integration tests require that an instance of kbase-ui be available at at a X.kbase.us host (where X is typically ci, next, appdev, narrative). The tests work by controlling a browser to invoke urls, click on buttons, fill in inputs, and watches to make sure "the right thing happens".  For example, the tests select menu items, conduct searches, log in, and log out. The tests can ensure that the right thing appears when a menu is selected, that the kbase session cookies is available after signin, that a given search resulted in the epxected items.

## Status

The integration testing tools are under active development. They do indeed work, and should be conducted prior to any release. 

## Testing Stack

The integration testing utilizes Selenium, WebdriverIO, Firefox and Chrome browsers, and our own integration library. Since almost all user functionality in the UI is provided through plugins, almost all integration tests reside in plugins as well. Each plugin should contain a testing folder `src/plugin/test`. This folder contains one or more json files. Each of these files defines one or more tests.  Each test defines 1 or more steps. All of the details will be spilled in sections below. We call these "integration test scripts".

> This is all very new. We may add javascript test scripts later, but for now we have much ground to cover just with simple json scripts.

During the kbase-ui build, all of the plugin testing scripts are placed into a single location `build/test/integration-tests/specs/plugins`. Also during the build, during the "init" phase specifically, all of the tools required for integration testing are installed locally.

> kbase-ui generally tries hard to follow the principle, encouraged by npm, to install all tools locally. The only global dependencies are those described in [Getting Started](../dev/getting-started.md).

Upon invoking the integration tests, all of the test scripts found in  `src/plugin/test` are run, and the results printed to the console. The integration tests may be run against multiple environments (ci, next, appdev, prod) and browsers (Firefox and Chrome are currently supported.)

It is even possible to run the tests against a testing service like Sauce Labs which may test against multiple browser models and versions and on multiple operating systems.

## Getting Started

You can run the integration tests from the basic kbase-ui development environment. 

Before running the tests, you must:

- build kbase-ui
- run the kbase-ui container
- build the proxier
- run the proxier container
- edit the test config file

Okay, that last step is a new one. The integration tests consult a single configuration file for information which cannot be included in the codebase itself. The following values must be set:

- Token - copy a valid login or dev token into this property

Then, in a separate terminal in the kbase-ui root directory, enter the following command:

```
make integration-tests host=ci
```

The `host` argument is a new one. It is roughly equivalent to the "env" argument used in the build process, and in fact by the time you (don't) read this, it will have migrated to this argument. At present all this argument does is substitute for the X in X.kbase.us when building the url for the tests scripts.

> TODO: we need other arguments to control basic test conditions: browser (choose from amongst configured browsers), plugins (pick one or more plugins to test, skip rest).

If all goes well, after several tens of seconds you should see a summary of the test results.

> TODO: the test reporter doesn't emit progress messages, just a report at the end; fix this

## Plugin Testing Script

Each plugin should have a directory `src/plugin/test` which contains one or JSON files containing test scripts.

[ describe the script format here ]

## kbase-ui integration test runner

[ describe the test runner scripts ]

Adding Testhooks 

## Testing Scenarios

### As you develop

### Before a release

### In Travis

## Browsers

### Firefox

some tests curently fail in FF; probably due to webdriver compat

### Chrome

chrome currently works in normal and headless

### Safari

Safari currently works. Don't know how to run headless yet. A bit finicky though; tends to leave a process behind, sometimes under fail conditions sometimes it just does it, and will refuse to start until the Safari process is killed.

First:

- Open Safari:

  - enable developer menu (Preferences > Advanced > Show Developer menu in menu bar)
  - enable automation (Developer > Allow Remote Automation )

- From Terminal:

  - /usr/bin/safaridriver --enable

  ​