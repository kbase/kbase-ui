
# Developing Alongside the Narrative

Just as it is easy to develop ui plugins, libraries, and internal components with a running kbase-ui instance, against any kbase deployment environment, it is also easy to use this same setup to work on certain aspects of the Narrative, particularly the UI.

## Prerequisites

- [Prerequisites](../getting-started/prerequisites.md)
- [Developer Setup](./getting-started.md)

## Installation

You should already have set up a working directory, in to which is installed kbase-ui and kbase-ui-proxier. From here, we will be accomplishing the following tasks:
- install Narrative repo
- build Narrative image
- configure proxier for the Narrative.

### Install Narrative Repo

This is simply placing the Narrative repo into the working directory.

```
cd ~/work/project
git clone -b develop https://github.com/kbase/narrative
```

### Build and Run Narrative Image 

The Narrative build is completely contained within a docker container. The container is run with a script which maps local directories into the container, so that local changes are reflected in the running Narrative.

```
cd narrative
make dev_image
make run_dev_image
```

#### Diff

A few small changes to the Narrative have not yet been integrated into the codebase to enable the above commands to work perfectly. Specifically `run_dev_image` is not yet integrated. It just runs this:

```
bash scripts/local-dev-run.sh
```

And the `local-dev-run.sh` script needs a little love too. Just remove the line:

```
    --mount type=bind,src=${root}/${ext_components_dir},dst=${container_root}/${ext_components_dir} \
```

That line is for mapping locally build external components into the container; however with the new dockerized build the external components are no longer installed into the local files. It is still possible to experiment with external component changes with this mount, but not often used and will be removed from the script.

### Configure kbase-ui-proxier for the Narrative

[ to be done ]
