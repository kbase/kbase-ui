---
---

# Quick Start

This guide should allow you to run kbase-ui on your host system. For more advanced developer or deployment scenarios, consult ...

## Prerequisites

Read the [prerequisites](prerequisites.md) guide to ensure your host machine is up to snuff.

## macOS

1. A kbase-ui project requires a dedicated directory, into which you will clone the repos you are working with.
2. open a terminal into this folder, either the built-in _Terminal_ program, _iTerm_, or your terminal app of choice.
3. Clone the _kbase/kbase-ui_ repo into this folder:
   ```bash
   git clone -b develop https://github.com/kbase/kbase-ui
   ```
4. Create and launch the kbase-ui image:

   Due to recent changes in the docker configuration, the make task has been replaced with less automated process. The following command line will build and launch the local development version of kbase-ui:

   ```bash
   make dev-start
   ```

   <!--```bash
   cd kbase-ui
   make docker-image build=dev
   make run-docker-image env=dev
   ```-->

5. Since that container is now running in the terminal, you'll need to open a new terminal window.
6. Point _ci.kbase.us_ to your local computer:

   Edit

   ```bash
   sudo vi /etc/hosts
   ```

   adding the line

   ```bash
   127.0.0.1	ci.kbase.us
   ```

   at the end of the file, then save it `[Shift][Z][Z]`

7. Open a browser to [https://ci.kbase.us](https://ci.kbase.us)
8. Since the proxy uses a _self-signed certificate_ to support https, your browser will likely complain. Just suffer through the prompts to allow the connection to proceed.[^2]
9. You should now see kbase-ui 😊
10. When done, you can simply press `[Control][C]` in the original terminal window to stop the containers.[^3]
11. If you won't be conducting further builds for this instance, you'll want to clear out the intermediate build image:[^4]

    ```bash
    make dev-clean
    ```

## Linux

[ to do ]

## Windows 10

[ to do ]

## Next Steps

- [Getting started with development](/development/getting-started.md)

\---

[^1]: If you use Terminal or iTerm, pressing `[Cmd][T]` will open a new tab in the terminal window, with the same directory.
[^2]: If your browser hangs when attempting to connect, you should have better luck using the private mode of your browser. Both Safari and Chrome work fine in private mode with self-signed certs, Firefox will still hang.
[^3]: Currently docker-compose does not always clean up after itself when using `[Control][C]` to stop it; see [this github issue](https://github.com/docker/compose/issues/3317).
[^4]: This also removes the Docker network "kbase-dev" created during image-building process.
