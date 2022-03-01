# install-plugins

This is a Deno script which will fetch, unpack, and install into the build, all
specified kbase-ui plugins.

It should be run through the Deno cli located in `tools/deno-cli`.

E.g.

```bash
HOST_APP_DIR=`PWD` docker compose run --rm deno run --unstable --allow-run --allow-write --allow-read /app/scripts/deno/install-plugins.ts /app/config/plugins.yaml /app/build/app/modules/plugins
```

A rather long command line. Let's break it down!

1. We first provided an environment variable for the Docker Compose file. The
   `HOST_APP_DIR` variable is used to set a directory mapped to the container's
   internal `/app` directory. We set it to the repo top level directory. `pwd`
   returns the absolute path to the current directory, and since we need to run
   this script from the `tools/deno-cli` directory (a constraint of docker
   compose), we indicate two directories above.

   The volume mounting requires absolute directories.

   ```bash
   DIR=`pwd`/../..
   ```

2. Next we run the Docker container using docker compose, specifying the `deno`
   service defined in the docker compose file.

   The name of the service within the docker compose file can be anything, but
   we've chosen `deno`, well, because it just makes sense.

   We use the `--rm` Docker Compose option in order to ensure the container is
   removed when it completes.

   ```bash
   docker compose run --rm deno
   ```

3. Next we issue the Deno `run` command with a bunch of command line options. It
   is important to know that within the container, the "entrypoint" is already
   set up to run deno and expects that the Deno command ("run" in this case) and
   all command line options to follow.

   ```bash
   run --unstable --allow-run --allow-write --allow-read
   ```

4. Finally, we provide the actual Deno script to run, followed by all of it's
   command line arguments. In this case, the first argument is the plugins
   config file, and the second is the directory into which to install the
   plugins.

   Note that all files and directories are specified as absolute paths within
   the container (remember that `/app` has been volume mounted to the entire
   repo).

   The script `/app/scripts/deno/install-plugins.ts` resides in the home of all
   deno scripts `/app/scripts/deno`.

   The `/app/config/plugins.yml` file lists all of the plugins, their locations,
   and their versions.

   The `/app/build/app/modules` specifies in which directory the plugins
   directory will be installed.

   ```bash
   /app/scripts/deno/install-plugins.ts /app/config/plugins.yaml /app/build/app/modules
   ```

---

deno run --allow-run --allow-write --allow-read install-plugins.ts
${PWD}/../../../config/plugins.yaml ${PWD}/temp
