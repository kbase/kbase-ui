---
---
# Testing

Plugins should have unit and integration testing. Not all plugins have any or adequate amount of any sort of testing. 

All plugins have at least a minimal integration test which loads the plugin via a url with the plugin's path. This simple test does at least ensure that the plugin code loads does not throw a significant enough error to halt rendering and mounting of its components.

Most plugins have minimal or no unit testing. Unit testing in ui code is difficult, and less effective compared to integration testing, so when we have time for testing we err on that of adding unit tests.

The older the codebase, the less likely it is to have any or useful tests. The newest plugins are based on CRA-Typescript, and thus carry the benefits of static typing and compilation, which, in essence, erases whole categories of errors that would otherwise, in a javascript codebase, require testing (and is never done -- in theory every JS test should throw every possible type into arguments and parameters, to ensure the code would behavior in a predictable manner in the face of dynamic typing mistakes.)

Unit tests are carried out within the plugin repo. Integration tests are run from the kbase-ui repo.

## Unit Testing

[ TODO ]

## Integration Testing

### For the Impatient

Seeing is believing, so let's go!

1. Ensure that you have `ci.kbase.us` mapped to your local host:

    ```bash
    sudo vi /etc/hosts
    127.0.0.1  ci.kbase.us
    ```

2. In a terminal at the root of the repo, perform a build of kbase-ui

   ```bash
   make dev-start
   ```

   Note that this will leave kbase-ui running against `ci.kbase.us`.

3. In another terminal at the root of the repo, run the integration tests:

   ````bash
   make integration-tests token=TOKEN
   ```

   where `TOKEN` is a login token for the `kbaseuitest` user.

### Overview

Integration tests are defined in yaml files by each plugin. These files serve as scripts which define a sequence of actions and assertions.

During a kbase-ui build, the test automation scripts and the test runner scripts are placed together into `test/integration-tests`. Remember, this is   inside the kbase-ui container. 

Previously, though, the development build process had created a volume mount from the local `dev/test` directory into this container `test` directory, making the integration test files available in the local development host environment. 

When you invoke `make integration-tests`, the Makefile calls the integration test script runner, which in turn loads all of the gathered integration tests. The script runner invokes all of the tests, and reports the results in the console.

### Updating Integration Tests

There are many testing scenarios, so let's describe this process with an example.

Say your task is to add a field to a existing form. There is an existing test which loads the form for the kbaseuitest user, and inspects the values of the form fields to ensure they are properly displaying.

Your task is to enhance the test to ensure that the newly added field is displaying properly.

### The first run

Before adding any tests, you should confirm that the existing tests still run. This establishes a baseline that everything is functioning before you begin work. If the tests pass, you have shown the changes you have made do not affect features currently tested.

### Test iteration

Now that you've established a baseline test run, showing that all tests are currently passing, you can focus only on the tests for the plugin you are developing.

To do so, add the `focus` option:

```bash
make integration-tests token=MYTOKEN focus=^MYPLUGIN/
```

The `focus` option provides one or more regular expressions to apply to the test scripts, selecting only the matching tests.

This works by applying the focus regex to the relative pathname of the test file within `dev/test/integration-tests/specs/plugins`. Since plugin tests are located in a folder with the plugin name, the plugin name may be used to match the first directory component.

Multiple plugins could be specified like:

```bash
make integration-tests token=MYTOKEN focus="^MYPLUGIN/ ^MYPLUGIN2/ ^MYPLUGIN3/"
```

Of course, you may use a simplified regex like `focus=MYPLUGIN`, which will probably work fine, since the plugin name is unlikely to occur in the path of another test file.

### Updating a test file

[ TODO ]

### Adding a test file

[ TODO ]

### More Information

This section is just meant to be an overview and quick start to integration testing.

See also:

- integration testing
- running integration tests

## Recipes

### Run integration tests in CI

- make a development build of kbase-ui

```bash
make dev-start build-image=t plugins="MYPLUGIN"
```

- edit `/etc/hosts`

```bash
127.0.0.1  ci.kbase.us
```

- run the integration tests

```bash
make integration-tests token=CI_TOKEN
```

### Run integration tests against Prod

- make a development build of kbase-ui

```bash
make dev-start build-image=t env=prod plugins="MYPLUGIN"
```

- edit `/etc/hosts`

```bash
127.0.0.1  narrative.kbase.us kbase.us
```

- run the integration tests

```bash
make integration-tests env=prod token=PROD_TOKEN
```
