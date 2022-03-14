# Deployment

kbase-ui is deployed as a Docker container which includes the compiled kbase-ui web app, kbase-ui plugins, and an nginx server to provide the http interface. This can be prepared locally on your host workstation or at GitHub via a GitHub Action workflow.

For both methods, the ultimate product is a Docker image which contains the above.

## Contents

- Build
    - [Local](./local-build.md)
    - [GHA Workflow](./gha-build.md)
- Deploy
    - [Local](./local-deploy.md)
    - [KBase](./kbase-deploy.md)

## Quick Start

The quickest way to get a production build of kbase-ui running locally!

- dependences - Make sure you have the following available:

    - make
    - docker
    - mkcert (optional)

- map ci.kbase.us to localhost

    In order to be able to access kbase-ui naturally, with login and login via KBase, it must be accessed via a browser at `https://ci.kbase.us` (or another environment).

    In order to accomplish this one must first map ci.kbase.us to the local host by editing the "hosts" file. The hosts file is located at:

    - `/etc/hosts` for macOS, Linux, FreeBSD and like systems
    - `?/hosts` for Windows

    ```shell
    ##
    # Host Database
    #
    # localhost is used to configure the loopback interface
    # when the system is booting.  Do not change this entry.
    ##
    127.0.0.1       localhost
    255.255.255.255 broadcasthost
    ::1             localhost

    # KBase
    127.0.0.1 ci.kbase.us
    # End KBase
    ```

    > Tip: I leave this in /etc/hosts and simply comment it out when not using it.

- set up developer cert

    By default, kbase-ui will use a self-signed certificate. However, using an https site with a self-signed certificate is painful, and adds work which forces the user experience to deviate from that which we provide to users in a real deployment.

    Fortunately there is a handy tool `mkcert` which can be used to create temporary ssl certificates which will make the browser happy.

    The make task

    ```shell
    make dev-cert
    ```

    will create a temporary certificate for kbase.us and *.kbase.us, install it into the system, install it into Firefox, and copy the certs to the local proxy used in the deploy.

- build and run kbase-ui:

    Compiling kbase-ui, downloading plugins, assembling files, building the image, and running the kbase-ui container and associated proxy is conducted with a single comamnd:

    ```shell
    make local-server
    ```


