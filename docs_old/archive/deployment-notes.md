# Deployment Notes


## Docker

..
..

## Configuration

Configuration resides in the following files

## config/builds

Each file contains build configuration information.



## config/deploy

Each file contains per-deployment configuration.
Most of this information is merged into other configuration files.


## config/ui

Each file contains per ui-build configuration (plugins, modules, menus)


## services.yml

url endpoints for kbase services.

## ui.yml

## Make

make init

make clean

make build
make build config=dev

make deploy 
make deploy config=dev