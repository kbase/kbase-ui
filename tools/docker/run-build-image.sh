function usage() {
    echo 'Usage: run-image.sh env'
}

function run_image () {
    build=$1
    root=$(git rev-parse --show-toplevel)
    image="kbase/uitool:dev"

    echo "Running uitool image ${image} for build ${build}."

    mount="--mount type=bind,source=${root}/tools/build/shared,target=/kb/shared"

    # echo "Mount: ${mount}"
    # echo ":)"

    docker run \
        --dns=8.8.8.8 --rm \
        --name=uitool \
        -e "build=$build" \
        ${mount} \
        ${image}
}

build=$1

if [ -z "$build" ]; then 
    echo "ERROR: argument 1, the build (dev, ci, or prod), not provided"
    usage
    exit 1
fi

run_image $build
