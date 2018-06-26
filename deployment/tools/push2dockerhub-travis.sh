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

# Required environment variables
# TRAVIS_* implied by the Travis environment
# IMAGE_NAME - the name of the image which has been built previous to running this script; see .travis.yml
# DOCKER_USER - secure travis parameters required for interation with dockerhub; see .travis.yml
# DOCKER_PASS 

set -o errexit
set -o nounset

# Ensure no syntax errors.
# Note: does not catch all errors, so test this script carefully.
bash -n "$0"

# This script only works with travis
if [ "${TRAVIS:-}" != "true" ]
then
    echo "Error: Not running in Travis"
    exit 1
fi

if [ -z "${TRAVIS_BRANCH}" ]
then
    echo "Error: A git branch was not found in TRAVIS_BRANCH"
    exit 1
fi

# $TAG was set from TRAVIS_BRANCH, which is a little wonky on pull requests,
# but it should be okay since we should never get here on a PR
if  ! ( [ "${TRAVIS_BRANCH}" == "master" ] || [ "${TRAVIS_BRANCH}" == "develop" ]  || [ "${TRAVIS_BRANCH}" == "docker-multi-stage" ])
then
    echo "Error: Will only push images for the master or develop branches; Will not push image for branch ${TRAVIS_BRANCH}"
    exit 1
fi


# Assign the tag to be used for the docker image from current branch as known to Travis.
TAG=`echo ${TRAVIS_BRANCH}`

# If the tag is master, we need to retag as latest before pushing
if [ "${TAG}" == "master" ]
then
    docker tag ${IMAGE_NAME}:${TAG} ${IMAGE_NAME}:latest || \
    ( echo "Failed to retag master to latest" && exit 1 )
    TAG="latest"
fi

# if [ "${TRAVIS_SECURE_ENV_VARS}" != "true" ]
# then
#     echo "Error: Travis secure environment variables (TRAVIS_SECURE_ENV_VARS) not found (${TRAVIS_SECURE_ENV_VARS})"
#     exit 1
# fi

if [ "${TRAVIS_PULL_REQUEST}" == "true" ]
then
    echo "Error: Will not push image for Pull Request"
    exit 1
fi

if [ -z "${DOCKER_USER:-}" ] 
then
    echo "Error: required (secure) environment variable DOCKER_USER not found"
    exit 1
fi

if [ -z "${DOCKER_PASS:-}"] 
then
    echo "Error: required (secure) environment variable DOCKER_PASS not found"
    exit 1
fi

# The Main Guts
echo "Logging into Dockerhub as ${DOCKER_USER}"
docker login -u ${DOCKER_USER} -p ${DOCKER_PASS} && \
echo "Pushing ${IMAGE_NAME}:${TAG}" && \
docker push ${IMAGE_NAME}:${TAG} || \
( echo "Failed to login and push tagged image" && exit 1 )
