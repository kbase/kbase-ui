# Build a kbase-ui docker image on Travis CI.

set -o errexit
set -o nounset

# Ensure no syntax errors.
# Note: does not catch all errors, so test this script carefully.
bash -n "$0"

# Guard - ensure we are running on Travis
if [ "${TRAVIS:-}" != "true" ]
then
    echo "Error: Not running in the Travis CI environment"
    exit 1
fi

# Import Travis variables in the normalized ones expected in the 
# docker-compose.yml file
export COMMIT="${TRAVIS_COMMIT}"
export TAG="${TRAVIS_TAG}"

# Use the REAL_BRANCH, which is set directly from git
# This solves the problem that travis does not correclty populate
# TRAVIS_BRANCH with the filter we use (branch + tag).
# But on a pull request 
if [ -n "${REAL_BRANCH}" ]
then
    echo "using real git branch"
    export BRANCH="${REAL_BRANCH}"
else
    echo "using travis branch"
    export BRANCH="${TRAVIS_BRANCH}"
fi

# We include the build date in the image as well.
export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# The BUILD variable is passed through to the kbase-ui build script which 
# uses this to select one of three build configurations: dev, ci, prod.
# dev is only supported for local development, and doesn't bundle or minimize
# ci doesn't insist on a semver tag, but does minimize and bundle.
# prod is the whole enchilada - it requires a semver tag on the tip of master, it minimizes and bundles
if [ "${BRANCH}" = "develop" ]
then
    export BUILD="ci"
elif  [ "${BRANCH}" = "master" ]
then
    export BUILD="prod"
elif [[ "${BRANCH}" =~ ^feature-.+$ ]]
then
    # feature branches do a CI build, since they are essentialy 
    # alternative CIs.
    export BUILD="ci"
else 
    echo "Not a supported branch: ${BRANCH}"
    echo "Supported branches are 'develop', 'master', and 'feature-*'"
    exit 1
fi

echo "Building kbase-ui with docker-compose on Travis CI"
echo "Using:"
echo "BUILD      : ${BUILD}"
echo "BRANCH     : ${BRANCH}"
echo "COMMIT     : ${COMMIT}"
echo "TAG        : ${TAG}"
echo "BUILD_DATE : ${BUILD_DATE}"

# Run docker compose just to build the image
docker-compose up --no-start --build