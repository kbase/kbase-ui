# Developing a Plugin Standalone

This document describes how to develop a CRA-TS based plugin which has been fully converted to a kbase-ui plugin.

A kbase-ui plugin is 99% independent SPA. That is, most of the code does not depend on kbase-ui at all. The plugin is simply started by kbase-ui, and then removed when the user navigates away from it to another kbase-ui component or plugin.

I'll just mention the old style of plugin development briefly, for contrast, perspective, and in case any of these older practices have crept into the documentation. In older Javascript plugins, the plugin codebase is mounted live into a running instance of kbase-ui. That is, when running a local instance of kbase-ui, the plugin source directory would be mounted into the kbase-ui container, replacing the plugin directory that would have been installed. This required the traditional edit / refresh development workflow. Other than the obvious downsides of this front end technology, it was rather straightforward.

For the last few years, however, plugins have been full-fledged, compiled, Typescript-based SPAs, based on Create React App (CRA), and adopting the standard CRA workflows. In such web apps, source code is not runnable, but rather must be compiled into a bundle. Although it is possible to replicate the old style workflow as edit / compile / build / refresh, there are significant benefits to the CRA workflow. And that workflow is incompatible with the old one.

To start with, it is quite possible to begin development of a kbase-ui plugin with no accommodation of its ultimate fate as a plugin. The primary hurdle if the web app is running against CI (e.g. auth, workspace, services) is to provide appropriate configuration to the app, and a KBase auth token to the browser for usage in the runtime. These are relatively easy to achieve without a lot of fuss.

However, we have developed some tooling to make plugin developing a bit easier once it has been converted to a full-fledged plugin.

## Converting to a Plugin

### Add dependencies

The kbase-ui integration requires the Redux library. Even if the app itself does not use redux, the integration libraries rely upon  Redux for controlling state, such as authentication and configuration.

    - install redux packages

      ```bash
      npm add -E redux react-redux @types/react-redux redux-thunk
      ```

      > TODO: check that types are still necessary, and the npm cli syntax. I usually update my package.json files directly.

### Create redux implementation files

    First we'll put the redux pieces in place, without any functionality. In this step we are going to create files with this structure:

    ```text
    redux
        actions.ts
        reducers.ts
        store.ts
    ```

    - create the top level `redux` directory within `react-app/src`.

      ```bash
      mkdir redux
      ```

    - within `redux`, create `actions.ts` with the following code

      ```typescript
      import { Action } from "redux";
      ```

    - within `redux`, create `store.ts` with the following code.

      ```typescript
      import { BaseStoreState, makeBaseStoreState } from "@kbase/ui-components";
      import { createStore, compose, applyMiddleware } from "redux";
      import thunk from "redux-thunk";
      import reducer from "./reducers";

      export interface StoreState extends BaseStoreState {}

      export function makeInitialStoreState(): StoreState {
        const baseStoreState = makeBaseStoreState();
        return {
          ...baseStoreState
        };
      }

      export function createReduxStore() {
        return createStore(reducer, makeInitialStoreState(), compose(applyMiddleware(thunk)));
      }
      ```

    - within `redux`, create `reducers.ts` with the following code

      ```typescript
      import { baseReducer, BaseStoreState } from "@kbase/ui-components";
      import { StoreState } from "./store";
      import { Action, Reducer } from "redux";

      const reducer: Reducer<StoreState | undefined, Action> = (state: StoreState | undefined, action: Action) => {
        const baseState = baseReducer(state as BaseStoreState, action);
        if (baseState) {
          return baseState as StoreState;
        }
        return state;
      };

      export default reducer;
      ```

### Add integration component to App.tsx

    Now that redux is set up, including integration into the core kbase-ui integration, we need to add a special integration component to our app to active it.

    - update `App.tsx` so that it looks like this:

      ```tsx
      import React from "react";
      import { Provider } from "react-redux";
      import { createReduxStore } from "./redux/store";
      import { AppBase } from "@kbase/ui-components";
      import "./App.css";

      const store = createReduxStore();

      interface AppProps {}

      interface AppState {}

      export default class App<AppProps, AppState> extends React.Component {
        render() {
          return (
            <Provider store={store}>
                <AppBase>
                  <div className="App">
                    <p>Hello!</p>
                  </div>
                </AppBase>
            </Provider>
          );
        }
      }
      ```

    - note the updates:
      - we added two new imports for `Provider` and `createReduxStore`
      - we used `createReduxStore` to create our initial redux store, which is stored in the top level App component's namespace.
      - we wrapped our app content in a `Provider` component, which ensures that our app has access to redux.
      - we added developer and kbase integration support with `AppBase` which were imported and then added as wrapper components around our app.

### Test it


    After a major set of changes like this, it is prudent to run the tests, and to exercise the web app, to ensure we didn't introduce bugs.

    ```bash
    yarn test
    ```

    The first thing you may notice is that the app now takes longer to compile. We've added a bunch more code, and Typescript compilation and the bundling process can slow down quite a bit when more code is added.

    The second notable event is that the test no longer passes!

    This is because our app is now nested inside the kbase integration layer, which asynchronously integrates with kbase-ui. Thus the `<App />` component is not loaded synchronously, and the expected `Hello!` text is not present immediately after the component is created.

    To fix this, alter the contents of `App.test.tsx` to:

    ```typescript
    import React from 'react';
    import { render, wait } from '@testing-library/react';
    import App from './App';

    test('renders learn react link', async () => {
        const { getByText } = render(<App />);

        await wait(() => {
            const linkElement = getByText(/Hello!/i);
            expect(linkElement).toBeInTheDocument();
        });
    });
    ```

    Note that we've moved the code which performs the inspection of the DOM to look for the required content into a function provided to `wait()`. The wait function will repeatedly run that function if the expectation fails, for up to 4.5 seconds. If the expectation does not succeed by the end of that interval, the test fails.

    > See: [Testing Library Docs](https://testing-library.com/docs/dom-testing-library/api-async)

    After saving these changes, the test should run again, and pass.
