function usage() {
    echo 'Usage: run-image.sh env'
}

root=$(git rev-parse --show-toplevel)
image="kbase/uitool:dev"

echo "stdout sent to uitool.stdout, stderr sent to proxier.stderr"
echo "Running proxier image ${image}"
echo ":)"

mount="--mount type=bind,src=${root}/tools/build/shared,dst=/kb/shared"

docker run \
  --dns=8.8.8.8 --rm \
  --name=uitool \
  ${image} \
  > /kb/shared/uiout.stdout
