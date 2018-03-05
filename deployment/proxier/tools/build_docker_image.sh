#!/bin/bash -x

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

    # Not tagged as in the usual sense, but the dev tag helps us keep the
    # images separate locally.
    tag="dev"

    local here=`pwd`
    echo "Running docker build in context ${here}/docker/context"
    docker build --build-arg VCS_REF=$commit \
        --build-arg BRANCH=$branch \
        --build-arg TAG=$tag \
        -t kbase/kbase-ui-proxier:$tag \
        ${here}/docker/context

    err=$?
    if (( $err > 0 )); then
        echo "Error running docker build: $err"
    else
        echo "Successfully build docker image. You may invoke it "
        echo "with tag \"kbase/kbase-ui-proxier:${tag}\""
    fi
}

build_image
