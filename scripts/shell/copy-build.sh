# Copy the react build 
cp -pr react-app/build build/dist
# ensure the legacy "modules" directory is empty
rm -rf build/dist/modules
# ensure the deploy directory is available
mkdir -p build/dist/modules/deploy