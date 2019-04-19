# Integration Testing

## Prerequisites

To get the most out of this document, you should be famliar with setting up kbase-ui locally for development and/or previewing. See [Getting Started](../dev/getting-started.md).

## Overview

At present, the focus of all testing in kbase-ui is integration testing. It gives the most bang for the buck, exercising not only multiple libraries, but plugins, configuration, and building too.

The integration tests require that an instance of kbase-ui be available at at a X.kbase.us host (where X is typically ci, next, appdev, narrative). The tests work by controlling a browser to invoke urls, click on buttons, fill in inputs, and watches to make sure "the right thing happens". For example, the tests select menu items, conduct searches, log in, and log out. The tests can ensure that the right thing appears when a menu is selected, that the kbase session cookies is available after signin, that a given search resulted in the expected items.

## Status

The integration testing tools are under active development. They do indeed work, and should be conducted prior to any release.

## Testing Stack

The integration testing utilizes Selenium, WebdriverIO, Firefox and Chrome browsers, and our own integration library. Since most user functionality in the UI is provided through plugins, most integration tests reside in plugins as well. Each plugin should contain a testing folder `src/plugin/test`. This folder contains one or more json or yaml files (yaml preferred). Each of these files defines one or more tests. Each test defines 1 or more steps. All of the details will be spilled in sections below. We call these "integration test scripts".

> This is all very new. We may add javascript test scripts later, but for now we have much ground to cover just with simple json scripts.

During the kbase-ui build, all of the plugin testing scripts are placed into a single location `dev/test/integration-tests/specs/plugins`. Also during the build, during the "init" phase specifically, all of the tools required for integration testing are installed locally.

> kbase-ui generally tries hard to follow the principle, encouraged by npm, to install all tools locally. The only global dependencies are those described in [Getting Started](../dev/getting-started.md).

Upon invoking the integration tests, all of the test scripts found in `src/plugin/test` are run, and the results printed to the console. The integration tests may be run against multiple environments (ci, next, appdev, prod) and browsers (Chrome headless is currently supported)

> Note that that test configuration can be set up to run tests against Chrome, Firefox, or Safari, but there is no automation for this; it would require tweaking the config file.

It is even possible to run the tests against a testing service like Sauce Labs which may test against multiple browser models and versions and on multiple operating systems.

## Getting Started

You can run the integration tests from the basic kbase-ui development environment.

Before running the tests, you must:

-   build kbase-ui
-   run the kbase-ui container
-   edit the test config file

Okay, that last step is a new one. The integration tests consult a single configuration file for information which cannot be included in the codebase itself.

A sample configuration file is placed at `dev/test/config.json`. This file contains dummy values which describe what you should substitute for them. The configuration file is assembled from sample configs provided by each plugin.

Configuration values include core configuration like a user token, the associated username, and associated real name, as well as plugin-specific data required for test running and comparisons.

### Core configuration

-   token - copy a valid login or dev token into this property
-   username - copy the username associated with this token
-   realname - copy the "realname" (as set in the auth2 record) for this token

### Plugin configuration

Each plugin test suite is configured by a key under the path `plugins\PLUGIN`, where PLUGIN is the plugin name.

## Running tests

In a separate terminal in the kbase-ui root directory, enter the following command:

```
make integration-tests host=ci
```

The `host` argument is roughly equivalent to the "env" argument used in the build process. At present all this argument does is substitute for the X in X.kbase.us when building the url for the tests scripts.

> TODO: we need other arguments to control basic test conditions: browser (choose from amongst configured browsers), plugins (pick one or more plugins to test, skip rest).

If all goes well, after several tens of seconds you should see a summary of the test results.

> TODO: the test reporter doesn't emit progress messages, just a report at the end; fix this

> NOTE: Due to the variability in test response times, some tests may time out. If this occurs, run the tests one or more times until (and if) they succeed. Common conditions for timeout-based test failures are local machine load (the tests are fairly cpu-intensive), network congestion, kbase service latency, and kbase service maintenance.

## Files

-   `dev/test` - placeholder directory for integration test scripts, code, and configuration; this directory is populated when the ui is built; the files are overlaid from the container via a volume mount.
-   `test/wdio.conf.integration.js` - webdriver io test configuration file
-   `src/test` - location of script runner files, which are copied into the kbase-ui image and subsequently made available locally through a volume mount at `/dev/test`.
-   `tools/proxy/contents/ssl` - empty directory which is populated with `test.crt` and `test.key` when `make dev-cert` is run (and emptyed by `make rm-dev-cert`).
-   `src/client/plugins/PLUGIN/test` - location of internal plugin integration test scripts
-   `kbase-ui-plugin-PLUGIN/src/plugin/test` - location of external plugin integration test scripts.

---

> LEFT OFF HERE - stuff below is old and/or unwritten

---

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

-   Open Safari:

    -   enable developer menu (Preferences > Advanced > Show Developer menu in menu bar)
    -   enable automation (Developer > Allow Remote Automation )

-   From Terminal:

    -   /usr/bin/safaridriver --enable

    ​
