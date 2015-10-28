# KBase User Interface

## Contents

- Prerequisites
- Installation


## Prerequisites

In general:

- git
- nodejs
- bower
- karma

### Macintosh

### Windows

### Linux

## Installation


1. Clone the kbase-ui repo

    Make yourself a nice cozy home in which to place kbase-ui. For testing and development you just need a single directory owned by you.

    ```
    mkdir -p work/kbase-ui-work
    cd work/kbase-ui-work
    git clone https://github.com/eapearson/kbase-ui.git
    cd kbase-ui
    ```

2. Build it

    The kbase-ui can build with a couple of lines typed at the console, or a single invocation of ```make```.

    ```
    npm install
    grunt build
    ```

    or 

    ```
    make
    ```

3. Run tests

    The tests can be run directly with karma, or through the make process

    ```
    karma start test/karma.conf.js
    ```

4. Local Deploy for development and testing

    The build process creates build directory which can be used directly as a web site root. 

    You may use the server of your choice, or use the built-in mini-web-server via

    ```
    grunt preview
    ```

5. Production Deploy

    The production deploy just copies the build directory to the appropriate location.