#!/bin/bash -x

# Much much longer than the original. Just wanted to get a handle
# on explicit error capture and handling.

function get_tag() {
    # local error variable captures subprocess exit code in $?
    # need this so that other commands don't overwrite it
    # the variable holding the git command subprocess output must be
    # declared local previously because local itself will reset $?
    local tag
    tag=$(git describe --exact-match --tags $(git rev-parse HEAD) 2>&1)
    local err=$?
    echo $tag
    exit $err
}

function get_branch() {
    local branch
    branch=$(git symbolic-ref --short HEAD 2>&1)
    local err=$?
    echo $branch
    exit $err
}

function get_commit() {
    local commit
    commit=$(git rev-parse --short HEAD 2>&1)
    local err=$?
    echo $commit
    exit $err
}

function build_image() {
    local branch=$TRAVIS_BRANCH
    local commit=$TRAVIS_COMMIT
    local tag=$TRAVIS_TAG
    local date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local err

    echo "DATE $date"

    if [[ -z "$branch" ]]; then
        branch=$(get_branch)
        err=$?
        if (( $err > 0 )); then
            echo "No branch available: ${branch}">&2
            exit 1
        fi
    fi
    echo "BRANCH ${branch}"

    if [[ -z "$commit" ]]; then
        commit=$(get_commit)
        err=$?
        if (( $err > 0 )); then
            echo "No commit available: ${commit}">&2
            exit 2
        fi
    fi
    echo "COMMIT: $commit"

    if [[ -z "$tag" ]]; then
        tag=$(get_tag)
        err=$?
        if (( $err > 0 )); then
            echo "Sorry, not on a tag, won't build: ${tag}">&2
            exit 3
        fi
    fi
    echo "TAG $tag"

    local image_tag="master"

    local here="$(dirname "$(dirname "$(readlink -fm "$0")")")"
    local here=`pwd`
    echo "Running docker build in context ${here}/docker/context" 

    # TODO: don't know why can't run this in a subprocess

    # NOTE: the image is tagged "master" for production builds. In a real
    # deploy the image would be pushed up to dockerhub with the master image tag.

    docker build \
        --build-arg BUILD_DATE=$date \
        --build-arg VCS_REF=$commit \
        --build-arg BRANCH=$branch \
        --build-arg TAG=$tag \
        -t kbase/kbase-ui:${image_tag} ${here}/docker/context

    err=$?
    if (( $err > 0 )); then
        echo "Error running docker build: $err"
    else
        echo "Successfully build docker image. You may invoke it "
        echo "with tag \"kbase/kbase-ui:${image_tag}\""
    fi
}

build_image
