
# Development Quick Start

- ensure deploy env is mapped to localhost in /etc/hosts; assume CI

    ```text
    127.0.0.1 ci.kbase.us
    ```

- after cloning this repo, open the repo root in VSC (required for dev workflow)

- open a terminal window, create the dev environment

    ```shell
    ./Taskfile dev-setup
    ```

- open the project in a devcontainer
    - Open the command browser: Shift + Command + P
    - enter "Reopen in Container" or enough until
      "Remote Containers: Reopen in Container" appears in the list
    - select "Remote Containers: Reopen in Container"
    - the first time make take a couple of minutes to fetch the images and build
      the containers
    - when complete you'll be in a shell inside the devcontainer (Ubuntu)

- work with the CRA web app just like at the local command line:

    ```shell
    root@3fd37706bf4d:/workspace# cd vite-app
    root@3fd37706bf4d:/workspace/vite-app# npm install
    root@3fd37706bf4d:/workspace/vite-app# npm run dev
    ...
     VITE v4.5.0  ready in 446 ms

    ➜  Local:   http://localhost:3000/
    ➜  Network: http://172.19.0.4:3000/
    ➜  press h to show help
    ```

- open browser to <https://ci.kbase.us>