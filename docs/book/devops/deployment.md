# Deployment

This document describes the process for deploying a version of kbase-ui.

- ensure release is ready
- tag release
- fetch release
- build it
- build image
- test image

## Ready the Release

A release is ready when the following conditions are met:

- release notes complete
- release config set
- canonical repo up-to-date with these changes in develop branch
- merge develop into master
- test the release from master locally
    - tag locally
    - build locally
    - build image locally
    - run locally in each environment
- tag master
- build code
- build image
- push to docker
- ??

### Release Notes

Release notes are located in the ```release-notes``` directory. A release notes is created for the next presumptive release, before the release is actually created. The release notes document is named ```RELEASE_NOTES_#.#.#.md``` where ```#.#.#``` is the version of the release. When a release notes document is created, it is also added to the ```index.md``` file in the same directory.

> Note: The release notes file is validated during the deployment process; the current release version number must match a release notes file.

The release notes document should begin with a summary of the changes, a section describing the nature of any major changes, and a section itemizing the changes, broken into the following sections: New, Unreleased, Improvements, Fixes

Each item should, if possible, note the JIRA ticket id in the markdown link format [ID](url).

### Release Config

A single config file defines the current release. This serves to tie the codebase to the current git tag. This file is located in config/release.yml. As part of the release process the property release.version must be set to the presumptive semver tag.

### Update Canonical Repo

The canonical kbase-ui repo, https://github.com/kbase/kbase-ui, must be updated with these changes.

> Note: We do not tag the release yet!

### Merge to Master

At present we still use the "develop/master" dual branch model, so we always merge the develop branch to master before testing the release and ultimately tagging it with the version.

> Note: With the advent of tagged releases, this is no longer necessary because we can always create a hotfix branch from a tag if necessary in order to deal with out-of-band updates to production.

To do this, you should first attempt a pull request through the github ui. To do this, 

- Navigate to https://github.com/kbase/kbase-ui
- Click the "New Pull Request" button
- Select as base "master", as compare: "develop".
- If there are no conflicts reported, create a title "Develop -> Master" and click "Create Pull Request"

#### Conflicts

If there are conflicts, it is best to perform the merge locally, resolve the issues, test the ui, and issue a pull request for the merge.

Conflicts may happen if much time has elapsed between releases and there have been hotfixes to the release which were not merged back into the develop branch.

It may be easiest to attempt a merge locally, identify the conflicts, and commit changes to the develop to prevent the conflicts, if possible.

First get it and generate the conflicts:

```bash
mkdir test-release
cd test-release
git clone -b master https://github.com/kbase/kbase-ui
cd kbase-ui
git merge origin/develop origin/master
```

Resolve the conflicts with your favorite tool. E.g.:

```bash
code .
```

Test for prod:

```bash
make build-prod
make prod-image
make run-prod-image
```

### Test the Presumptive Release

Once the develop branch has been merged into the master branch, or even from the pull request, you should test the release.

```bash
mkdir test-release
cd test-release
git clone https://github.com/kbase/kbase-ui
cd kbase-ui
git fetch origin pull/PULL#/head:test-PULL#
git checkout test-PULL#
```




## Testing a tag locally

This is necessary for local next/appdev/prod testing since the build will fail if there is no tag on the current commit.

```
git tag -a v1.5.0 -m "1.5.0"
```

after additional commits you'll need to delete the tag and the add it again

```
git tag -d v1.5.0
```




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

The makefile target "build" will build the kbase-ui files. The make target "build-ci" will also
build a minified version of kbase-ui suitable for deployment.

### build the image

The makefile target "docker_image" is a target shared with many KBase repos that build
docker deployment images. This makefile target requires that the "build-ci" makefile target has
been run in order to generate the files that are to be published in the docker_image. Note that
the "ci" in "build-ci" is construed to mean build for continuous integration _in general_ rather
than build for the CI environment _specifically_.

The build process builds an image named kbase/kbase-ui:$TAG where $TAG is the current branch
that is checked out. If the branch is master, $TAG substitutes "latest" for master.

The Travis-CI environment performs builds of the master and develop branches, and pushes the new builds into
dockerhub. It should not be necessary to modify docker images for different environments, aside from
passing in difference values for the environment variables.

It should also not be necessary to retag a develop image as latest in order to promote it for release.
The image tagged with latest should automatically track the master branch of the repo.

The docker image is built to be suitable for development mode (serves up JS files un-minified)
as well as in production ( serves up JS files minified as well as a minified archive of all the libraries).
The settings for running in CI, AppDev, Next and Prod KBase environments are handled via templates that
are populated at runtime for each particular environment. The template files can be found in this directory
under the repository root: deployment/ci/docker/context/contents/conf

The templates are build for use with the [docker tool](https://github.com/kbase/dockerize) and follow
the Golang [text/template](https://golang.org/pkg/text/template/) templating rules. At runtime the
dockerize program is given environment variables as well as the templates that need to be rendered,
and these determine the nginx configuration as well as the details of the content to be served. The
dockerfile in deployment/ci/docker/context/Dockerfile shows the parameters passed to dockerize to
configure the container.

Examples of environment variables for each different deployment environment ( CI, AppDev, Next, Prod ) can
be found in deployment/conf/*.env
These files contain name/value pairs for environment variables that can be interpreted by either docker
as an --env_file parameter, or as files that dockerize can directly read, via the dockerize --env
parameter.

For the purposes of the config.json file, the key environment variable that determines the running environment
is the "deploy_environment" variable, which is set to ci, appdev, next, prod as necessary. Another important
variable is the flag "uncompress", if this variable is set, then the nginx container will serve the uncompressed
versions of the JS files. Leave uncompress *undefined* (not false or 0) to serve minified content.

Other important environment variables are:

* nginx_listen - what port the nginx server should listen on. Note that the container only serves cleartext content. SSL should be handled by a separate proxy
* nginx_server_name - What server name should the nginx server present itself as?
* nginx_loglevel - what level of logging should be set in the nginx error log?
* nginx_syslog - enable syslogging of the nginx access and error logs

As a rule, when there are differences in images between dev, CI, AppDev and Prod, work the differences
into the template files or else have the differences enabled/disabled via environment variables or
some configuration file setting.
