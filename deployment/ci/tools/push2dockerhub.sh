#!/bin/bash
#
# This script is intended to be run in the deploy stage of a travis build
# It checks to make sure that this is a not a PR, and that we have the secure
# environment variables available and then checks if this is either the master
# or develop branch, otherwise we don't push anything
#
# NOTE: IMAGE_NAME is expected to be passed in via the environment so that this
# script can be more general
#
# sychan@lbl.gov
# 8/31/2017

# Assign the tag to be used for the docker image, and pull the git commit from either
# the TRAVIS_COMMIT env var if available, or else get the short commit via git cmd

# This script should only be operated in the CI environment, which should always
# be on develop branch.

if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "Cannot push image in CI when on a Pull Request"
    # But this will be common, so don't fail the script call
    exit 0
fi
if [ -z "$IMAGE_NAME" ]; then
    echo "IMAGE_NAME is required"
    exit 1
fi
if [ "$TRAVIS_BRANCH" != "develop" ]; then
    echo "Cannot push an image in CI when not on the develop branch"
    echo "In fact, we should not even be able to run this script"
    exit 1
fi
if ( [ "$TRAVIS_SECURE_ENV_VARS" != "true" ] ); then
    echo "Cannot push image in CI when secure variables unavailable"
    exit 1
fi
if ( [ -z "$DOCKER_USER" ] || [ -z "$DOCKER_PASS" ] ); then
    echo "DOCKER_USER and DOCKER_PASS are required"
    exit 1
fi

TAG="develop"

# We need the commit because this is what the image was tagged with
# previously,
COMMIT=${TRAVIS_COMMIT:-`git rev-parse --short HEAD`}

echo "Logging into Dockerhub as $DOCKER_USER"
docker login -u $DOCKER_USER -p $DOCKER_PASS && \
docker tag $IMAGE_NAME:$COMMIT $IMAGE_NAME:$TAG && \
echo "Pushing $IMAGE_NAME:$TAG" && \
docker push $IMAGE_NAME:$TAG || \
( echo "Failed to login and push tagged image" && exit 1 )
