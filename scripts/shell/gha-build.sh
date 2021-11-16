# This script is responsible for building the CRA-TS web app,
# placing into a build directory, and installing plugins into 
# that build directory in the expected location.
# This build directory is then ready for the Docker image build.
sh scripts/shell/build.sh
sh scripts/shell/clean-build.sh
sh scripts/shell/copy-build.sh
sh scripts/deno/install-plugins.sh