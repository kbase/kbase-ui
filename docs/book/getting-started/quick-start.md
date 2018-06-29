# Quick Start

This guide should allow you to run kbase-ui on your host system. For more advanced developer or deployment scenarios, consult ...

## Prerequisites

Read the [prerequisites](prerequisites.md) guide to ensure your host machine is up to snuff.

## macOS

1. A kbase-ui project requires a dedicated directory, into which you will clone the repos you are working with.
2. open a terminal into this folder, either the built-in *Terminal* program, *iTerm*, or your terminal app of choice.
3. Clone the following repos into this folder: *eapearson/kbase-ui*, *eapearson/kbase-ui-proxy*
    ```bash
    git clone -b docker-multi-stage https://github.com/eapearson/kbase-ui
    git clone https://github.com/eapearson/kbase-ui-proxy
    ```
4. Create and launch the kbase-ui image:
    ```bash
    cd kbase-ui
    make docker-image build=dev
    make run-docker-image env=dev
    ```
5. Since that container is now running in the terminal, you'll need to open a new terminal window.[^1]
6. Create and launch the *kbase-ui-proxy* image:
    ```bash
    cd ../kbase-ui-proxy
    make docker-image
    make run-docker-image env=dev
    ```
    
7. Since that container is now running in the terminal, you'll need to open a new terminal window.
8. Point *ci.kbase.us* to your local computer:

    Edit
    ```bash
    sudo vi /etc/hosts
    ```
    adding the line
    ```bash
    127.0.0.1	ci.kbase.us
    ```
    at the end of the file, then save it ```[Shift][Z][Z]```
9. Open a browser to [https://ci.kbase.us](https://ci.kbase.us)
10. Since the proxy uses a *self-signed certificate* to support https, your browser will likely complain. Just suffer through the prompts to allow the connection to proceed.[^2]
11. You should now see kbase-ui 😊
12. When done, you can simply press ```[Control][C]``` in each terminal window to stop the containers.
13. If you won't be conducting further builds for this instance, you'll want to clear out the intermediate build image:[^3]

```bash
make docker-clean
```

\---

[^1]: If you use Terminal or iTerm, pressing ```[Cmd][T]``` will open a new tab in the terminal window, with the same directory.

[^2]: If your browser hangs when attempting to connect, you should have better luck using the private mode of your browser. Both Safari and Chrome work fine in private mode with self-signed certs, Firefox will still hang.

[^3]: This also removes the Docker network "kbase-dev" created during image-building process.