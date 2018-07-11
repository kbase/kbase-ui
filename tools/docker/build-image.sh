#!/bin/bash -x

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
    local build=$1

    # Since we are building from a git repo, we can rely upon git
    # for finding the  project root cross-platform.
    local root=$(git rev-parse --show-toplevel)

    # SETUP FOR BUILD IMAGE
    local here=`pwd`

    echo "Running docker build in context ${root} for build ${build}"

    # SETUP FOR FINAL IMAGE
    local branch=$TRAVIS_BRANCH
    local commit=$TRAVIS_COMMIT
    local tag=$TRAVIS_TAG
    local date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local err

    echo "DATE: $date"

    if [[ -z "$branch" ]]; then
        branch=$(get_branch)
        err=$?
        if (( $err > 0 )); then
            echo "No branch available: ${branch}">&2
            exit 1
        fi
    fi
    echo "BRANCH: ${branch}"

    if [[ -z "$commit" ]]; then
        commit=$(get_commit)
        err=$?
        if (( $err > 0 )); then
            echo "No commit available: ${commit}">&2
            exit 2
        fi
    fi
    echo "COMMIT: $commit"

    local image_tag=kbase/kbase-ui:${branch}

    docker build \
        --build-arg BUILD_DATE=$date \
        --build-arg VCS_REF=$commit \
        --build-arg BRANCH=$branch \
        --build-arg BUILD=$build \
        -f $root/Dockerfile \
        -t $image_tag \
        $root
        
    err=$?
    if (( $err > 0 )); then
        echo "Error running docker build: ${err}"
    else
        echo "Successfully built docker image. You may invoke it "
        echo "with tag \"${image_tag}\""
    fi
}

build=$1

if [ -z "$build" ]; then 
    echo "ERROR: argument 1, the build (dev, ci, or prod), not provided"
    usage
    exit 1
fi

build_image $build
