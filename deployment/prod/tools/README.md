# Deployment Tools and Resources

This directory contains all of the tools and resources for a docker based deploy of kbase-ui in any of our environments (ci, next, appdev, prod) once the ui has been built.

Note that a parallel set of tools is available in the /dev directory, since the image needs to support interactive development.

The deployment process is described in /docs, but briefly:

An image is built which will contain the kbase-ui build, an nginx server, and necessary boilerplate for configuration during docker run. When the image is run the entrypoint script will have been provided with enough information to create a configuration file for the desired runtime environment. It will proceed to create the config file and then launch the nginx server.

That is it.

## Building image

### tag the repo

Before pulling down the image for building, it should have been tagged. In fact, the clone you are building from should have been pulled down by that tag.

The tag should be checked into the canonical repo, and the local clone based on that tag.

For local testing of the build, you can tag locally to simulate this.

E.g. 

git tag v1.5.0 -m "1.5.0"

To remove the tag

git tag --delete v1.5.0

### Build kbase-ui

The ui production build will only work if it is checked out on a specific tag.

### build the image

```bash
bash tools/build_docker_image.sh
```
