---
---

# Integration Testing

## Prerequisites

To get the most out of this document, you should be famliar with setting up kbase-ui locally for development and/or previewing. See [Getting Started](../dev/getting-started.md).

## Overview

At present, the focus of testing in kbase-ui is integration testing. It gives the most bang for the buck, exercising not only multiple libraries, but plugins, configuration, and building too.

The integration tests require that an instance of kbase-ui be available at at a X.kbase.us host (where X is typically ci, next, appdev, narrative). The tests work by controlling a browser to invoke urls, click on buttons, fill in inputs, and watches to make sure "the right thing happens". For example, the tests select menu items, conduct searches, log in, and log out. The tests can ensure that the right thing appears when a menu is selected, that the kbase session cookies is available after signin, that a given search resulted in the expected items.

## Status

The integration testing tools are under active development. They do indeed work, and should be conducted prior to any release.

## TL;DR

So you just want to run the tests?

1. build kbase-ui
2. run kbase-ui against the target environment
    typically `ci` (the default), but could be `next`, `narrative-dev`, or `prod`.
    1. edit /etc/hosts to point that environment to the localhost

      ```text
      sudo vi /etc/hosts
      127.0.0.1 ci.kbase.us
      ```

    2. run kbase-ui:

    ``` bash
    make dev-start build-image=t env=ci
    ```

3. add a token for the same environment
    1. log into that environment from the browser 
        1. you'll need to log in as the user "kbaseuitest"; contact a kbase-ui dev for the account info.
    2. copy a kbase token out of the browser.
        1. e.g. open the javascript console and enter:

        ```javascript
        document.cookie
        ```

        and then look for the value of `kbase_session`

    3. paste the token into the config file `dev/test/integration-tests/config.json`. It should be clear where to paste the token in the placeholder `KBASE_TOKEN_HERE`.
4. run the tests
    ```bash
    make integration-tests env=ci
    ```
    > Note that `ci` is the default 
    

## Testing Stack

The integration testing utilizes Selenium, WebdriverIO, Firefox and Chrome browsers, and our own integration library. Since most user functionality in the UI is provided through plugins, most integration tests reside in plugins as well. Each plugin should contain a testing folder `src/plugin/test`. This folder contains one or more json or yaml files (yaml preferred). Each of these files defines one or more tests. Each test defines 1 or more steps. All of the details will be spilled in sections below. We call these "integration test scripts".

> This is all very new. We may add javascript test scripts later, but for now we have much ground to cover just with simple json scripts.

During the kbase-ui build, all of the plugin testing scripts are placed into a single location `dev/test/integration-tests/specs/plugins`. Also during the build, during the "init" phase specifically, all of the tools required for integration testing are installed locally.

> kbase-ui generally tries hard to follow the principle, encouraged by npm, to install all tools locally.

Upon invoking the integration tests, all of the test scripts found in `src/plugin/test` are run, and the results printed to the console. The integration tests may be run against multiple environments (ci, next, appdev, prod) and browsers (Chrome headless is currently supported)

It is even possible to run the tests against a testing service like Sauce Labs which may test against multiple browser models and versions and on multiple operating systems.

## Getting Started

You can run the integration tests from the basic kbase-ui development environment.

Before running the tests, you must:

- build kbase-ui
- run the kbase-ui container
- edit the test config file

Okay, that last step is a new one. The integration tests consult a single configuration file for information which cannot be included in the codebase itself.

A sample configuration file is placed at `dev/test/config.json`. This file contains dummy values which describe what you should substitute for them. The configuration file is assembled from sample configs provided by each plugin.

Configuration values include core configuration like a user token, the associated username, and associated real name, as well as plugin-specific data required for test running and comparisons.

### Core configuration

- token - copy a valid login or dev token into this property
- username - copy the username associated with this token
- realname - copy the "realname" (as set in the auth2 record) for this token

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

- `dev/test` - placeholder directory for integration test scripts, code, and configuration; this directory is populated when the ui is built; the files are overlaid from the container via a volume mount.
- `test/wdio.conf.integration.js` - webdriver io test configuration file
- `src/test` - location of script runner files, which are copied into the kbase-ui image and subsequently made available locally through a volume mount at `/dev/test`.
- `tools/proxy/contents/ssl` - empty directory which is populated with `test.crt` and `test.key` when `make dev-cert` is run (and emptied by `make rm-dev-cert`).
- `src/client/plugins/PLUGIN/test` - location of internal plugin integration test scripts
- `kbase-ui-plugin-PLUGIN/src/plugin/test` - location of external plugin integration test scripts.

---

> LEFT OFF HERE - stuff below is old and/or unwritten

---

## Plugin Testing Script

Each plugin should have a directory `src/plugin/test` which contains one or YAML files containing test scripts.

> At present the integration test tools support YAML or JSON, but YAML is preferred due the ability to add comments and comment out tests, which are quite handy during testing work.

### Test Script Format

A plugin can have one or more test scripts. Each script should be dedicated to a set of concerns, such as a route. Each plugin should have a test script for each route.

A test script may contain one or more test specs. Each spec is composed of one or more test tasks. Any task may cause a test spec failure.

The basic structure is:

- test
  - spec 1
    - task 1
    - task 2
    - task 3
  - spec 2
    - task 1
    - task 2

```yaml
# Test Script for Dashboard Plugin
---
- description: Dashboard with authentication
  specs:
    - description: Dashboard should appear when the route is navigated to
      tasks:
        - title: login
          subtask: login
        - title: navigate to dashboard
          navigate:
            path: dashboard
        - switchToFrame:
            selector:
              - type: iframe
                value: plugin-iframe
            wait: 1000
        - selector:
            - type: plugin
              value: dashboard
            - type: widget
              value: narratives-widget
            - type: slider
              value: your-narratives
          wait: 10000
        - selector:
            - type: plugin
              value: dashboard
            - type: widget
              value: narratorials-widget
            - type: slider
              value: narratorials
          wait: 10000
        - selector:
            - type: plugin
              value: dashboard
            - type: widget
              value: shared-narratives-widget
            - type: slider
              value: shared-narratives
          wait: 10000
        - selector:
            - type: plugin
              value: dashboard
            - type: widget
              value: public-narratives-widget
            - type: slider
              value: public-narratives
          wait: 10000
```

#### Test

Each test script has a single top level node which describes the test. The most important aspect of it is the `description` field. This field should briefly describe the test. It will be printed in the test results, so should be descriptive enough to distinguish the test amongst many. It should mention the plugin name as well as the overall purpose of the test.

#### `description`

Describes the test script; it should mention the plugin name as well as the overall purpose of the test.

#### `baseSelector`

A selector to be applied to all spec tasks which specify document navigation with a selector. It can be handy to avoid boilerplate in selectors, since a plugin's tests should primarily operate within the plugin's dom subtree.

#### selectors

A key concept of the integration test scripts is dom navigation. After all, the primary mechanism of integration tests is to poke at the ui and observe how it changes. Both the actions and observations are require that one specify a location with in the DOM -- and that location is defined by a DOM selector.

In a test script, the selector is represented as an array of objects - each object describes the next DOM node in the selection path.

There are two basic ways to specify a path node. The preferred way is to use a special _testhook_ embedded in the plugin's markup. Testhook support is built into the test tool, and requires less configuration in the test script. Other than testhooks, any attribute and attribute value can be used as a selector.

##### testhook selectors

A "testhook" is simply a special data- attribute which has been applied to a node. The format is `data-k-b-testhook-type`, where `type` is one of `plugin`, `component`, `widget`, `button`, `element` and so forth.

The testhook type lets us reduce collisions, and improve readability.

The format `k-b-testhook` is driven by the need to namespace the `data-` attribute with some form of `kbase`. In legacy kbase functional html style, this is specified in code as `dataKBTesthookType`, which is not as strange as `data-k-b-testhook-type`. Now, one might think that `data-kbase-testhook-type` is more pleasing on the eyes, but the code form of that is `dataKbaseTexthookType`, which is error-prone since the official form of `kbase` is `KBase`, which would result in `data-k-base-testhook-type`, which does not seem like an improvement.

Here is an example of setting and specifying a testhook:

Using legacy kbase functional html style:

```javascript
div({
  dataKBTesthookPlugin: "myplugin"
});
```

In the test script:

```yaml
- type: plugin
  value: myplugin
```

##### raw selectors

The usage of raw selectors is frowned upon, but sometimes necessary. The testhook form is preferred because it is orthogonal to all other usage of DOM node attributes. Classes, for instance, are primarily associated with visual concerns. A developer may be altering classes to improve appearance, and not realize that it is a critical component of a test. By using a dedicated attribute format for testing, tests are much more stable over time and easier to debug, since the same prefix is used for all testhooks.

However, at times we don't have control over markup. For instance, we may be using components which don't allow custom attributes.

In such cases, the test script can use the type `raw`, and specify any arbitrary attribute name and optional value.

E.g.

Using legacy kbase functional html style:

```javascript
div({
  class: "someclass"
});
```

In the test script:

```yaml
- type: raw
  name: class
  value: someclass
```

#### Spec

## kbase-ui integration test runner

[ describe the test runner scripts ]

## Integration Test Script

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
