# Step 6. Setup as Plugin

So far we have managed to create a simple CRA-based web app, with a few tweaks. Now we will install the machinery needed to run this web app as a kbase-ui plugin.

1. Set the target JS language

    By default a CRA app is configured to target ES5. This gives the broadest browser coverage. However, since we already require ES6 browser compatibility, the generated code will be more compact and understandable if we target ES6.

    Edit `react-app/tsconfig.json` to set the property `compilerOptions.target` to `"ES6"`.

2. Set the homepage property

    By default the CRA does not set the `"homepage"` property. The default behavior does not work well for our app, since it assumes the app path is at the url root `/`. The plugin react app will operate at a url path that looks like `/modules/plugins/PLUGIN/iframe_root`. We don't want to hard-code that value in our app, if we can.

    What we can do is set the homepage property to `./`.

    Edit the file `react-app/package.json` to add the top level property:

    ```json
    "homepage": "./",
    ```

3. Set up Proxy

    For local development with `npm run start`, let's make the built-in proxy work with KBase's CI environment. This will proxy requests from `http://localhost:3000` (or wherever the local dev server is running, this is the default url) to `https://ci.kbase.us`.

    Add the `proxy` property to `package.json` like so:

    ```json
    "proxy": "https://ci.kbase.us"
    ```

    You may proxy this development server to any KBase environment, such as production, simply by changing the proxy url. However, in normal practice we proxy against CI in order to avoid potential disruption those environments.

    > TODO: We now support proxying against any deployment environment via the command line using a more advanced proxying configuration...

    > TODO: add chapter on advanced proxying...

4. Set up the KBase integration dependency

    Integration into kbase-ui depends on two KBase npm packages.

    - Install the _kbase-ui-lib_ package. This package contains general support for working with KBase, including service libraries.

      ```bash
      yarn add -E @kbase/ui-lib 
      ```

    - Install the _kbase-ui-components_ package. This package contains component-specific support, plugin component support, as well as custom KBase components.

        ```bash
        yarn add -E @kbase/ui-components
        ```

    > TODO: Hmm, it looks like package-lock.json someone got in there. it needs to be removed - also, need to determine why it is there in the first place.

    - if `package-lock.json` is present in the directory, remove it.

5. Fix new dependency

    After installing any new dependencies, it is a good idea to update `package.json` to ensure that the dependency version expressions are absolute. We do that by editing `package.json`.

    - edit `package.json`
    - note the new dependencies:

      ```json
      "@kbase/ui-lib": "x.y.z",
      "@kbase/ui-components": "x.y.z",
      ```

      where `x.y.z` is the current version of `@kbase/ui-lib`.

    - fix other dependencies

      Note that other dependency version have a caret character `^` prefix. 

      The `^` prefix to the dependency versions means that npm is allowed to install the most recent version of the package with the same major version number. Thus a version expression of `^1.0.0` may result in version `1.5.13` being installed.

      We would rather our builds be deterministic and repeatable, so we want to simply remove the `^` prefix. npm will have installed the most recent versions of the packages, so we don't have to inspect the versions to ensure we have the most recent one.

      The `-E` option used in our commands will ensure that new dependency versions are recorded exactly in package.json

6. Install redux:

    The KBase integration requires the usage of Redux in the react app. Even if the app itself does not need to manage app state (although it is hard to imagine a kbase-ui plugin worth creating without significant state!), the integration requires the usage of Redux as the storage location for data sent from kbase-ui when the plugin is loaded.

    - install redux packages

      ```bash
      yarn add -E redux react-redux @types/react-redux redux-thunk
      ```

7. Create redux implementation files

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

8. Add integration component to App.tsx

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

9. Test it


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

10. Run the app

    ```bash
    yarn start
    ```

    The first thing you should notice is that instead of "Hello" and "Hi!", you now are confronted with a dialog box

    ![Dev Authorization Form](./images/authorization-form.png)

    This is the "Developer Authorization Form". Essentially it allows you to add a KBase auth cookie to the browser, and remove it.

    To proceed to the App, you should enter a CI login token into the **Token:** field and click the **Assign Token** button.

    You should now see the token user's real and user name displayed, and a logout button:

    ![Dev Authorization Form - Authorized](./images/authorized-form.png)

11. Walk like a Duck

    Now we need to add the files kbase-ui expects in order to load this web app as a plugin.

    - Add the plugin config file `config.yml` in the `plugin` directory:

      At the top level of the project, create the `plugin` directory:

      ```bash
      mkdir plugin
      ```

      Then add the plugin configuration file `config.yml`:

      ```yaml
      ## Plugin Configuration
      ---
      package:
        author: KBase Developer
        name: example-hello
        description: An example plugin which says "hello"
        type: iframe
      install:
        routes:
          - path: ["example-hello"]
            view: main
            widget: kb_iframe_loader
            authorization: true
            # TODO: get rid of this!!
            params:
              plugin: example-hello
        menu:
          - name: example-hello
            definition:
              path: ["example-hello"]
              label: Example Hello
              icon: flask
      ```

      > TODO: make this simpler; we can get rid of the params.plugin and the widget setting

      [ discuss it here ]

12. Adjust CRA build

    Now that we have a "home" for the plugin, we need to ensure that the web app is available within the plugin.

    You may have noticed that running `yarn build` creates a directory `react-app\build`. This directory contains the entire web app, compiled into a small set of files.

    This directory is excluded from our repo via .gitignore, because we need to prepare the plugin directory in a specific manner in order to integrate it into kbase-ui.

    <!-- We accomplish this simply by copying the static build into the `iframe_root` directory. -->

    - Create a `scripts` directory in the top level directory:

        ```bash
        mkdir scripts
        ```

    - Add some developer dependencies:
      - `yarn add -E -D bluebird tar fs-extra`

      > Note: this adds a package.json file at the top level of the repo.

    - Create a `install-plugin.js` file in the `scripts` directory with the following content:

        ```javascript
        /*eslint-env node */
        /*eslint strict: ["error", "global"] */
        'use strict';
        const bluebird = require('bluebird');
        const fs = bluebird.promisifyAll(require('fs-extra'));
        const path = require('path');
        const tar = require('tar');

        /*
        Copy the react-app build files into the iframe_root directory of the
        dist/plugin.
        */
        async function copyBuildFiles(rootDir) {
            const root = rootDir.split('/');
            const source = root.concat(['react-app', 'build']).join('/');
            const dest = root.concat(['dist', 'plugin', 'iframe_root']).join('/');
            await fs.ensureDirAsync(dest);
            await fs.copyAsync(source, dest);
        }

        async function removeDist(rootDir) {
            const root = rootDir.split('/');
            const dist = root.concat(['dist']).join('/');
            await fs.removeAsync(dist);
        }

        /*
        Create the dist directory, and copy the plugin directory into it.
        */
        async function copyPluginTemplate(rootDir) {
            const root = rootDir.split('/');
            const source = root.concat(['plugin']).join('/');
            const dest = root.concat(['dist', 'plugin']).join('/');
            await fs.ensureDirAsync(dest);
            await fs.copyAsync(source, dest);
        }

        async function taritup(rootDir) {
            const dir = 'dist';
            const dest = rootDir.concat(['dist.tgz']).join('/');
            console.log('tarring from ' + dir + ', to ' + dest);
            return tar.c({
                gzip: true,
                file: dest,
                portable: true,
                cwd: rootDir.join('/')
            }, [
                dir
            ]);
        }

        async function main() {
            const cwd = process.cwd().split('/');
            const projectPath = path.normalize(cwd.join('/'));
            console.log(`Project path: ${projectPath}`);

            // Remove dist
            console.log('Remove dist...');
            await removeDist(projectPath);

            // Copy files to dist.
            console.log('Copying files to dist...');
            await copyPluginTemplate(projectPath);
            await copyBuildFiles(projectPath);

            // Tar up dist
            console.log('tar-ing dist...');
            try {
                await taritup(projectPath.split('/'));
            } catch (ex) {
                console.error('Error tarring up dist! ' + ex.message);
            }
            console.log('done');
        }

        main();
        ```

    - Add a this as a npm script `install-plugin` to the top level `package.json`:
  
      ```json
      "scripts": {
        "install-plugin": "node scripts/install-plugin.js"
      }
      ```

13. Add new top level support:

    - Create the file `LICENSE.md` at the top level of your repo, with the following content:

      ```markdown
      Copyright (c) 2019 The KBase Project and its Contributors

      Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

      The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

      THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
      ```

    - Fluff up the `README.md` file

      We created a README.md file when the repo was created at github, but we need to utilize the common readme format.

      The recommended template is based on  [common-readme](https://github.com/noffle/common-readme) with some minor modifications.

        - **Title** as the first level header
        - **One line description** as quoted text
        - **Longer description**
        - All sections below as second level header
        - **Usage**: describe how to use it
        - **Background**: (recommended) the plugin is probably the front end for an area of complex of KBase functionality, which should be the subject of the background.
        - **API**: (optional) for a library, describe the api or link to the docs
        - **Install**: (optional) if the repo has some installation aspect, describe or reference it here
        - **Acknowlegements**: a list of major contributors to code, architectural design, and so forth; (optional) link to their GitHub profile or other home page.
        - **See Also**: a list of related projects, linked.
        - **License**: Will always be "SEE LICENSE IN LICENSE", since the KBase open source license is contained within the separate LICENSE file.

    - Copy the following sample into `README.md` and complete each relevant section. Unnecessary sections may be removed.

      ```markdown
        # TITLE

        > SINGLE SENTENCE

        BRIEF DESCRIPTION

        ## Usage

        HOW TO GET STARTED and USE IT

        ## Install

        INSTALLATION OF DEPENDENCIES, THE THING ITSELF

        ## Background

        HOW THIS FITS INTO KBASE

        ## API

        IF IT IS A LIBRARY OR SERVICE

        ## Acknowledgments

        - NAME - COMMENT

        ## See Also

        - [TITLE](URL)

        ## License

        SEE LICENSE IN LICENSE
      ```

      - Refs
        - [Awesome README](https://github.com/matiassingers/awesome-readme) 
        - collection links to examples, specs, articles, tools.

      - Tooling
        - [common-readme](https://github.com/noffle/common-readme) - an effort to, er, create a standard readme

      ```markdown
      ```

    - We also need to add additional information to the top level `package.json`.

      ```json
      {
        "name": "kbase-ui-plugin-{PLUGIN}",
        "version": "1.0.0",
        "description": "description of your plugin",
        "main": "index.js",
        "devDependencies": {
          "common-readme": "^1.1.0"
        },
        "scripts": {
            "build-plugin": "bash scripts/build-plugin.bash"
        },
        "repository": {
          "type": "git",
          "url": "git+https://github.com/kbase/kbase-ui-plugin-{PLUGIN}.git"
        },
        "author": "KBase Developers",
        "license": "SEE LICENSE IN LICENSE",
        "bugs": {
          "url": "https://github.com/kbase/kbase-ui-plugin-{PLUGIN}/issues"
        },
        "homepage": "https://github.com/kbase/kbase-ui-plugin-{PLUGIN}#readme"
      }
      ```

    - Create the `build-plugin.bash` script in the `scripts` directory:

      ```bash
      echo "Running plugin build script"
      cd react-app && \
      yarn install --cache-folder=".yarn-cache" && \
      echo "✓ dependencies installed successfully" && \
      yarn build && \
      echo "✓ built successfully" && \
      yarn test --watchAll=false && \
      echo "✓ tests run successfully" && \
      cd .. && \
      yarn install-plugin && \
      echo "✓ plugin setup successfully" && \
      echo "✓ plugin installed successfully"
      ```

    - Try out the script from the root of the project:

      ```bash
      yarn build-plugin
      ```

14. Push up plugin repo

    We are about to add the plugin to the kbase-ui build config. When we do this there are two methods available - bower (deprecated) and git. We'll use the git method.

    - perform a final dev start, build, and test cycle.

    - commit all changes and push up the new plugin repo to your personal account at github.

      ```bash
      git add .
      git commit -m "my great changes"
      git push origin master
      ```

## References

- https://redux.js.org/recipes/migrating-to-redux

## Next Step

[Step 7. Add Ant Design](./7-add-ant-design)

\---
