# Docker Build and Run Tools

Tools, Dockerfile, and config templates to build and run a multi-stage Docker image for kbase-ui.

## Basic Instructions

1. Clone the repo and cd into it
    - the build tools will determine the root based on git

2. Build the image:
    - ```make build-image build=BUILD_TAG```

        where *BUILD_TAG* is a build configuration file corresponding to a file in ./config/build/configs/*BUILD_TAG*.yml;
        current supported builds are ```dev```, ```ci```, ```prod```.

3. Run the image:
    - ```make run-image-dev env=ENV_TAG```

        where *ENV_TAG* corresponds to a deploy environment and a corresponding environment file
        located in ./config/deploy/*ENV_TAG*.env

## Deployment

[ to be done ]

## Development

This image may be used for development. 

- build using the *dev* build:

    ```make build-image build=dev```

    which calls

    ```./tools/docker/build-image.sh dev```


- run using the *dev* or *ci* environment and with appropriate overlays:

    - note that we use a script specific to develop-time. This script contains bits to handle directory overlays into the image.

    ```make run-image-dev env=dev plugins="PLUGIN_ID"```

    which in turn runs:

    ```./tools/docker/run-image-dev.sh dev -p PLUGIN_ID```

    E.g. to work on the dataview (landing page) plugin, use 
    
    ```make run-image-dev env=dev plugins="dataview"```

