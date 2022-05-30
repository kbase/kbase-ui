# Clear the dist dir
rm -rf build/dist

# Copy the react build
cp -pr react-app/build build/dist

# Copy the deploy configs into the dist
cp -pr build/build build/dist/build

# Copy the plugins into the dist
cp -pr build/plugins build/dist/plugins

