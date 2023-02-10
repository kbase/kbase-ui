# Step 7. Plugin Packaging

`kbase-ui` expects a plugin to be packaged in a specific manner. This step describes how to add support to create such a "plugin package".

We'll be adding these files:

```text
plugin
    config.yml
build
    make-plugin.js
    package.json
build.sh
docker-compose.yml
```

> The repo https://github.com/kbaseIncubator/kbase-ui-plugin-example can be used as a copy-pasta source.


1. Add the plugin config file `config.yml` in the `plugin` directory.

   The plugin config provides identification and integration information to kbase-ui which it uses during the build process.

    At the top level of the project, create the `plugin` directory:

     ```bash
     mkdir plugin
     ```

     Then add the plugin configuration file `config.yml`:

     ```yaml
     ## Test Plugin
     package:
       name: test
       description: Test Plugin
       type: iframe
     services:
       route:
         autoload: true
         routes:
           - path: test
             view: test
             authorization: true
       menu:
         items:
           - name: test
             path: test
             label: Test
             icon: flask
     
     ```

2. Add packaging scripts

    The plugin and plugin configuration need to be packaged in a specific way in order to be installable into kbase-ui.

    We use `docker compose` to run all of our build tasks, both locally and in GitHub actions. The `build.sh` shell script (tested under bash and zsh), orchestrates the tasks. First it builds the web app, just as we did by hand above but within the docker container. Then it arranges the built files and the plugin config into the expected distribution directory structure and packages that up with tar and gzip.

3. `build.sh` script

    This script runs all of the tasks to build and package the plugin. Each task is run vi npm within the node container.

    ```shell
    #!/bin/bash
    
    echo "---------------------------"
    echo "INSTALLING APP DEPENDENCIES"
    echo "---------------------------"
    DIR="${PWD}/react-app" docker compose run --rm node npm install
    
    echo "---------------------------"
    echo "BUILDING APP"
    echo "---------------------------"
    DIR="${PWD}/react-app" docker compose run --rm node npm run build
    
    echo "---------------------------"
    echo "INSTALLING PACKAGING DEPENDENCIES"
    echo "---------------------------"
    DIR="${PWD}" docker compose run --rm node npm --prefix build install
    
    echo "---------------------------"
    echo "PACKAGING PLUGIN"
    echo "---------------------------"
    DIR="${PWD}" docker compose run --rm node npm --prefix build run package-plugin
    
    echo "---------------------------"
    echo "PLUGIN BUILD FINISHED"
    echo "---------------------------"
    ```

    Make the script executable:

    ```shell
    chmod a+x build.sh
    ```

4. `docker-compose.yml`

    Our container is run by docker compose. It is a simple, default node container which should use the current node LTS, currently version 18 as of the time of writing. Note that it requires a `DIR` environment variable which is volume-mounted to the `/app` directory inside the container.

    ```yaml
    version: '3.6'
    services:
        node:
            working_dir: /app
            image: node:18
            container_name: node
            dns: 8.8.8.8
            volumes:
                - $DIR:/app
    ```

5. `build/package.json`

    This npm package definition file is only used for installing the required external dependencies and providing the packaging script as an npm script.

    ```json
    {
      "name": "package-plugin",
      "scripts": {
        "package-plugin": "node package-plugin.js"
      },
      "dependencies": {
        "fs-extra": "11.1.0",
        "tar": "6.1.13"
      }
    }
    ```

6. `make-package.js`

    This is our little script for copying all required files into the `dist` directory, and then packaging that directory up with `tar` and `gzip` via node.

    ```javascript
    'use strict';
    const fs = require('fs-extra');
    const path = require('path');
    const tar = require('tar');
    
    async function removeDist(projectPath) {
        const dist = path.join(projectPath, 'dist');
        await fs.remove(dist);
    }
    
    async function copyBuildFiles(projectPath) {
        const source = path.join(projectPath, 'react-app/build');
        const dest = path.join(projectPath, 'dist/plugin/iframe_root');
        await fs.ensureDir(dest);
        await fs.copy(source, dest);
    }
    
    async function copyPluginDir(projectPath) {
        const source = path.join(projectPath, 'plugin');
        const dest = path.join(projectPath, 'dist/plugin');
        await fs.ensureDir(dest);
        await fs.copy(source, dest);
    }
    
    async function archiveDist(projectPath) {
        const dest = path.join(projectPath, 'dist.tgz');
        return tar.c({
            gzip: true,
            file: dest,
            portable: true,
            cwd: projectPath
        }, ['dist']);
    }
    
    async function main() {
        const projectPath = path.normalize(path.join(process.cwd(), '..'))
        await removeDist(projectPath);
        await copyPluginDir(projectPath);
        await copyBuildFiles(projectPath);
        await archiveDist(projectPath);
    }
    
    main();
    ```

7. Try it out!

   ```shell
   ./build.sh
   ```

   You should see the main prize now in the repo root: `dist.tgz`. If you are using VSC, note that it is shown in gray, indicating that it will not be included in any git commits. 

   In addition, several other things have appeared:
   - dist
   - build/node_modules
   - build/package-lock.json

Now that we have a local build, we need to prepare for the "real" build at GitHub.

## Next Step

[Step 8. GitHub Actions](./7-github-actions)

\---
