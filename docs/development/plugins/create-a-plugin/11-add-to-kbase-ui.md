# Step 8: Add To KBase UI

1. add to `plugins.yml`

    The kbase-ui configuration file `plugins.yml` located in the `config` directory (of the kbase-ui repo!) lists all kbase-ui plugins which will be included in the kbase-ui build.

    All plugins are contained in a list underneath the `plugins` top level property. Each plugin is represented by a list item:

    ```yaml
    - name: example
      globalName: kbase-ui-plugin-example
      version: 0.1.0
      source:
          github:
            account: kbaseIncubator
            release: true
    ```

2. Note that our plugin has a version! But this configuration won't work unless we actually create a release version `0.1.0`.

     - Pull up your plugin repo at GitHub.

     - Create a pull request from your branch to the `main` branch

     - Ensure that the PR can build properly

     - > PR process omitted
  
     - Click the releases "tab" ![Github Release Tab Button](./images/github-release-button.png)

     - Click the "Create a new release" button ![Create a new release](./images/create-a-new-release-button.png)

     - In the first field, labeled "Tag version", enter `v0.1.0`

       ![Tag version field](./images/tag-version-field.png)

       - this is the release tag, and should follow this format:
         - starts with the letter `v`
         - followed by a semantic version

       - note the first version `0.1.0`. This indicates the first development version, with no patches. A major version of `0` should always indicate a development version. Special rules apply to development versions, compared to release versions (major version is `1` or above).

     - In the second field, labeled "Release title", enter `0.1.0`.

       ![Release title field](./images/release-title-field.png)

       - There is nothing special about the title - you may also want to add a short stretch of text after the version

     - Click the button to add release notes. Free text for the description field is optional.

     - click the Publish Release button.

       ![Publish Release button](./images/publish-release-button.png)

     - You match watch the build in the Actions tab, and when that is complete, visit the release page to ensure that the `dist.tgz` file is attached to it.

3. Incorporate into dev workflow

   The plugin can be incorporated into the build workflow in a static or dynamic manner. We'll start with static and then convert to dynamic.

   The following assumes you have run through this set of instructions and have set up kbase-ui.

   It is of course at your discretion to interpret them in your own context.

   - in the kbase-ui root rebuild the dev environment, or just the plugins:

   ```shell
   make dev
   ```

   or

   ```shell
   make install-plugins
   ```

   - Restart kbase-ui

   ```shell
   make start
   ```

   - Pull up kbase-ui in the browser, navigating to the plugin:

   ```url
   https://ci.kbase.us#example
   ```

3. Build the ui

    ```bash
    make dev-cert
    make start build-image=t
    ```

    > If you've already set up the dev cert, you may skip that part above.

4. Rewire CI host

    - edit `/etc/hosts`

    - add the following line:

      ```bash
      127.0.0.1   ci.kbase.us
      ```


5. Pull up the ui in your browser at `https://ci.kbase.us`.

6. Iterating on plugin

    - Start the ui with:

      ```bash
      make start plugins="my-plugin"
      ```

    - After changes to the plugin, you will need to do a full build. From the top level of the repo:

      ```bash
      npm install
      ```

    - This installs top level dependencies (not necessary here) and more importantly runs the post install script, which both builds the plugin and moves it into the correct location for the ui.

7. Add to ui menu:

    > to be written

## Next Step

[Step 9. Add Testing](./9-add-testing)

\---
