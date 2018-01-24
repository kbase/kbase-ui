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

Conflicts may happen if there has been much time has elapsed between releases and there have been hotfixes to the release which were not merged back into the develop branch.

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

The ui production build will only work if it is checked out on a specific tag.

### build the image

```bash
bash tools/build_docker_image.sh
```
