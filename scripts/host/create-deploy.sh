# Clear the dist dir
rm -rf build/dist

# Copy the react build
cp -pr react-app/build build/dist

# ensure the deploy directory is available
mkdir -p build/dist/deploy

# cp -pr build/plugins build/dist/deploy