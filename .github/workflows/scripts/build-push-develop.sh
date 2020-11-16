#! /usr/bin/env bash

export MY_ORG=$(echo "${GITHUB_REPOSITORY}" | awk -F / '{print $1}')
# Note the -develop suffix to the "MY_APP", which is really the image name.
export MY_APP=$(echo $(echo "${GITHUB_REPOSITORY}" | awk -F / '{print $2}')"-develop")
export DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
export COMMIT=$(echo "$SHA" | cut -c -7)
export BUILD="$BUILD"

echo $DOCKER_TOKEN | docker login ghcr.io -u $DOCKER_ACTOR --password-stdin
docker build --build-arg BUILD_DATE="$DATE" \
             --build-arg COMMIT="$COMMIT" \
             --build-arg BRANCH="$GITHUB_HEAD_REF" \
             --build-arg PULL_REQUEST="$PR" \
             --build-arg BUILD="$BUILD" \
             --label us.kbase.vcs-pull-req="$PR" \
             -t ghcr.io/"$MY_ORG"/"$MY_APP":"develop" .

# note that the imge reference below must match that above, as specified in -t (tag).
docker push ghcr.io/"$MY_ORG"/"$MY_APP":"develop"