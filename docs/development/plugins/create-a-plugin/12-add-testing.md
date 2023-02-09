# Step 9: Add Testing

Testing is a required aspect of the front end development workflow. In ui development we utilize both *unit* and *integration* tests.

Unit tests are typically restricted to testing one component, file, or namespace in isolation. Unit testing does not typically require very much setup, and does not require a browser. Unit tests are quick to run, and may be run throughout the development day.

Integration tests, on the other hand, typically test visible aspects of the interface as it operates in an actual web browser. These types of tests are much slower, and cannot practically be run multiple times per day. They are most often run prior to a release, against each deployment environment.


## Unit Tests

Unit testing is built into CRATS workflow with jest and support libraries. To make React Component unit testing even easier we utilize Enzyme with jest.

1. Install Enzyme

    ```bash
    npm install --save enzyme enzyme-adapter-react-16 react-test-renderer @types/enzyme @types/enzyme-adapter-react-16
    ```

2. Tweak the test configuration in package.json:

    ```json
    "jest": {
        "collectCoverageFrom": [
            "src/**/*.{ts,tsx}",
            "!/node_modules/",
            "!src/index.tsx",
            "!src/serviceWorker.ts"
        ]
    },
    ```

3. Add a unit test file `View.test.tsx` for `View.tsx`, in the same directory.

    When creating a test for a component one typically starts with the bare minimum test to ensure that the test file works and the component can be loaded without error.

    Test files are created in the same directory as the file they are testing. They test file is named after the file it is testing, with the `.test` added before the `.tsx` or `.ts`.

    ```typescript
    // We need to import React, even though we don't explicity use it, because
    // it's presence is required for JSX transpilation (the React object is
    // used in the transpiled code)
    import React from "react";

    // Enzyme needs

    import { configure, shallow, render, mount } from "enzyme";
    import Adapter from "enzyme-adapter-react-16";

    // We always need to import the component we are testing
    import View from "./View";

    configure({ adapter: new Adapter() });

    it("renders without crashing", () => {
    const setTitle = (title: string) => {
        return;
    };
    shallow(<View setTitle={setTitle} />);
    });
    ```

4. Tests are run from the `react-app` directory like so:

    ```bash
    npm run test
    ```

5. Test coverage is run similarly:

    ```bash
    npm run test -- --coverage 
    ```

    > Note that the `--watchAll=false` option, which was previously advised, is no longer necessary, due to fixes in the `jest` library.

6. An html report is also produced in `react-app/coverage/lcov-report/index.html`. This report reveals, for each tested file, which lines of code have not been tested. This is critical for identifying untested code, and creating new tests to cover it.

## Integration Tests

Whereas unit testing provides fine-grained broad coverage of the codebase, integration tests are fewer in number but exercise through features in the context of the final web app. This results in deep, vertical tests. Integration tests are also often applied to actual deployment environmentss.

Each plugin as well as kbase-ui itself provide integration tests. During a kbase-ui build, all integration tests are gathered together and may be run in one batch.

Integration tests themselves are written as test scripts as a yaml file.

This document will not describe in detail the integration test system, see ____..

1. Create a `test` folder within the `plugin` folder.

    ```bash
    mkdir plugin/test
    ```

2. Add a simple integration test script file `first.yaml`:

    ```yaml
    ---
    description: Show hello message
    specs:
       - description: the hello message should appear
           baseSelector: []
           tasks:
            # run subtask "login" which injects a token (from config in kbase-ui)
            - subtask: login
            # The "navigate" action will trigger a ui route request to the given path
            - action: navigate
                path: example-hello
            # The subtask "plugin" will navigate to the plugin iframe.
            - subtask: plugin
            # Now we get to the actual testable components.
            # Above, a failure will indeed fail the test, but below we are actually
            # poking at the plugin.
            - wait: forText
                selector:
                  - type: plugin
                      value: my-plugin
                  - type: field
                      value: SOME_FIELD_VALUE
                text: SOME_TEXT_VALUE
    ```

3. Commit and push up the changes

    Since the integration tests are made available to kbase-ui during the build process, we need to ensure that the plugins repo has been updated.

4. Make a fresh kbase-ui build

5. Make a fresh local kbase-ui build

6. Run integration tests

## Next Step

[Step 10. Add Documentation](./10-add-documentation)

\---
