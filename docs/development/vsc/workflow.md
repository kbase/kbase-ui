# Development - Visual Studio Code - Workflow

Development workflow with Visual Studio Code (VSC) utilizes a VSC devcontainer with docker compose.

This creates a development workspace and also launches associated support services.

## Quick Start

- open the project in VSC
- ensure that the "Remote - Containers" VSC plugin is activated
- reopen the project with devcontainer enabled:
    - macOS: <shift><command><P>
    - type: "reopen"
    - select "Remote-Containers: Reopen in Container"
    - if this is the first time, the container will need to be built
- open a VSC terminal
    - the terminal will be opened inside the container
- navigate to the react-app directory
    - ```shell
      cd react-app
      ```
- install dependencies
    - ```shell
      npm ci
      ```
      > this ensures a clean install

- start the app
    - ```shell
      npm run start
      ```
- this will take a minute or two to compile the app and start the dev server
- if the dev server opens a window, ignore it
- while waiting, edit your "hosts" file to point ci.kbase.us to localhost:
    - `vi /etc/hosts`
    - ```shell
      ##
      # Host Database
      #
      # localhost is used to configure the loopback interface
      # when the system is booting.  Do not change this entry.
      ##
      127.0.0.1	localhost
      255.255.255.255	broadcasthost
      ::1             localhost
      # KBase
      127.0.0.1 ci.kbase.us
      ```
- take your browser to `https://ci.kbase.us`
    - if you get a 502, no worries this just means that the dev server has not fully started yet, just try again in a bit
    - if the browser starts to load the app but it spins for a few seconds, don't worry; after the dev server starts it does take a few seconds, perhaps 10-20, for the server to be able to pass the request on to the web app.

## How it Works

> TO DO