#!/bin/bash -x
function build_image() {
    local here=`pwd`
    local tag="dev"
    local name="kbase/uitool:${tag}"

    echo "Running docker build in context ${here}/docker/context"

    docker build \
        -t $name \
        ${here}/docker/context

    err=$?
    if (( $err > 0 )); then
        echo "Error running docker build: $err"
    else
        echo "Successfully built docker image. You may invoke it "
        echo "with tag \"${name}\""
    fi
}

build_image
