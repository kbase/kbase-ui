# Local Deploy Image

It can be very useful to use an image built at GitHub in a local workflow.
It helps one have confidence that the build is good. You can use it
with your browser to verify that expected changes are present. You can use it
with local simulated deployment environments with the kbase-ui proxy. You can
use it as the target of integration tests.

## How To

### Determine the image name at GitHub

Visit [the kbase-ui packages at
GitHub](https://github.com/kbase/kbase-ui/pkgs/container/kbase-ui), and note the
image reference.

The most recent image is listed at the top, and older ones below.

You'll need to copy the bit that looks like `ghcr.io/kbase/kbase-ui:pr123`.

### Start up local server with image specified

```shell
IMAGE=ghcr.io/kbase/kbase-ui:pr123 ./Taskfile run-server
```

### Configure the local proxy for the desired environment

This will generate the local proxy config for the local kbase-ui running with
the ci environment.

```shell
DEPLOY_ENV=ci KBASE_UI_HOST=kbase-ui KBASE_UI_PORT=80 KBASE_UI_HOSTNAME=legacy ./Taskfile generate-proxy-env
```

### Start up the local proxy

```shell
./Taskfile run-proxy
```

## See Also

- GHA support
- [Local development proxy](./local-proxy.md)
