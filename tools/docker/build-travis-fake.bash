
root=$(git rev-parse --show-toplevel)

cd "${root}"

function git_tag() {
    # local error variable captures subprocess exit code in $?
    # need this so that other commands don't overwrite it
    # the variable holding the git command subprocess output must be
    # declared local previously because local itself will reset $?
    local tag=$(git describe --exact-match --tags $(git rev-parse HEAD) 2>&1)
    local err=$?
    echo $tag
    exit $err
}

function git_branch() {
    local branch=$(git symbolic-ref --short HEAD 2>&1)
    local err=$?
    echo $branch
    exit $err
}

function git_commit() {
    local commit=$(git rev-parse --short HEAD 2>&1)
    local err=$?
    echo $commit
    exit $err
}

export TRAVIS="true"
export TRAVIS_TAG=$(get_tag)
export TRAVIS_BRANCH=$(git_branch)
export TRAVIS_COMMIT=$(git_commit)
export BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

echo "FAKE TRAVIS BUILD: $BUILD"

bash "${root}/deployment/tools/build-travis.bash"

# docker-compose -f ${root}/docker-compose-travis.yml up --no-start --build