# Step 1. Set up kbase-ui work environment

Read the [prerequisites](getting-started/prerequisites.md) guide to ensure your host machine is up to snuff.

> TODO: add prerquisites here, as it is quite short now

## macOS

1. A kbase-ui project requires a dedicated directory, into which you will clone the repos you are working with. Go ahead and create this folder, which we'll refer to in this document as `project`.

2. Open a terminal into this folder, either the built-in _Terminal_ program, _iTerm_, or your terminal app of choice.

3. Clone the _kbase/kbase-ui_ repo into this folder:

   ```bash
   git clone -b feature-crats-refactor https://github.com/kbase/kbase-ui
   ```

   Of course, if you prefer to work with ssh authorization, use that form instead:

   ```bash
   git clone -b feature-crats-refactor ssh://git@github.com/kbase/kbase-ui
   ```

4. In previous instructions, it was advised to use **mkcert** to install a temporary developer SSL certificate, with the default being a self-signed cert. However, as browser and http behavior has become more strict over the years, it now seems quite unreliable to use a self signed cert.

​		So, to that effect, please follow the instructions for installing a [local kbase cert.](../../development/local-kbase-cert)

5. Set up the development environment

   ```shell
   make dev
   ```

   What does this do?

   Well, since we are going to be running kbase-ui in development mode, it will not be operating as an entire kbase-ui deployment. In order to enable this we need to build some development artifacts to help us out. This consists of plugins and configuration.

   > TODO: Argh, we need to deal with the kbase-ui config. Fortunately it contains on secrets, so we can just embed it back into the codebase.

5. Create and launch the kbase-ui web app.

   `kbase-ui` is based on Creat React App, and as such follows the typical developer workflow `npm run start`, with a twist. It runs inside a Visual Studio Code *devcontainer*.

   Now, this is not a requirement for dealing with kbase-ui development, but it is the supported workflow.

   The *devcontainer* is essentially integrated Docker compose automation.

   In this workflow, the devcontainer is started, you get a terminal prompt, and you can then proceed to launch kbase-ui in development mode.
   
   - Assuming you have Visual Studio Code (VSC) installed
   
   - from the repo directory, open VSC
   
     ```shell
     cd kbase-ui
     code .
     ```
   
   - open the Command Palette from the menu **View/Command Palette...** or the key combination **`[Shift][Command]P`**
   
   
   - type **reopen in container**; before you finish typing that the command **Dev Containers: Reopen in Container** should be at the top of the list.
   
   
   - Select **Dev Containers: Reopen in Container** 
   
   
   - It may take a few minutes the first time, as images need to be downloaded and built. 
   
   
   - Open the built-in VSC terminal, either with **``[Ctrl]` ``** or the **view > terminal** menu.
   
   
   - The terminal is now opened up inside the Docker container! Now we'll start up the web app:

    ```shell
    cd react-app
    npm install
    npm run start
    ```

-  You should see kbase-ui compiling, and eventually you'll see acknowledgment that the web app is ready

![npm-run-started](/Users/erikpearson/Work/KBase/2021Q3/miniprojects/kbase-ui-crats/kbase-ui/docs/development/plugins/create-a-plugin/images/npm-run-started.png)


6. Now, I didn't explain this above, but the devcontainer actually launches two other containers. One is a proxy, which enables you to operate kbase-ui (and other things, but that is another topic) behind a standard KBase host. It defaults to `ci.kbase.us`. The second container is a deployment server, which allows the kbase-ui's CRA dev proxy to forward requests for plugins and the deployment configuration to it.

7. You'll need to open a macOS terminal window for the next steps. [^1]

8. Point _ci.kbase.us_ to your local computer:

   Edit

   ```bash
   sudo vi /etc/hosts
   ```

   adding the line

   ```bash
   127.0.0.1	ci.kbase.us
   ```

   at the end of the file, then save it `[Shift][Z][Z]`

   > Why? It allows the full kbase-ui expeirence, including sign-in, which would otherwise not be possible. 

10. Open a browser to [https://ci.kbase.us](https://ci.kbase.us).

11. You should now see kbase-ui 😊

12. When done, you can simply press `[Control][C]` in the original terminal window to stop the dev server, and then use the command palette to find and execute **Dev Containers: Reopen Folder Locally**. This will stop the containers, and display the local terminal.


[Step 2. Create Plugin Repos](./2-create-repos)

\---

[^1]: At this point, the VSC terminal for the kbase-ui project will always open a terminal into the container when it has been opened as a devcontainer.
[^2]: If your browser hangs when attempting to connect, you should have better luck using the private mode of your browser. Both Safari and Chrome work fine in private mode with self-signed certs, Firefox will still hang.
