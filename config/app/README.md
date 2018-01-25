# App Config Files

This directory contains the primary config files for the kbase ui web app.

It contains a global configuration file (ui.yml) as well as per-environment configs (ci, dev, prod). The global config is always applied, and the per-environment configs are selected via the build config chosen in config/builds.

The configuration files are used in the build process to produce a master configuration file for the ui web app. This configuration file is build by merging each of the config files in this order:

ui.yml -> environment menus -> environment services = master config

Thus the base config establishes global values which may be over ridden by per-environment values.

## ui.yml

Contains the global configuration for the ui.

The top level config keys are:

deploy

ui 

docsite