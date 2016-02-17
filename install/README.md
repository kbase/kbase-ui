# Install Tool for KBase UI

This directory contains tools to deal with the kbase-ui app in the context of the system it is working on. This directory will exist in the top level of the kbase-ui repo, and will also be installed into the kbase-ui application directory upon installation. This allows the tool to be used to reconfigure kbase-ui during runtime. The main use case is to reconfigure kbase-ui services.

The reason for this to exist is that the config files are built by applying the standard config ini files to a template, the product of which is a yaml file which is consumed by the ui upon loading in the browser. This file, *service.yml*, contains primarily service endpoints, but also other urls such as the doc site and globus. It should contain any information which might change between different deployment environments.

The basic installation or reconfiguration process is:

- update or create the appropriate deploy config file
- apply the config file to the template
- copy the resulting services file into the target location within the source tree.

It is notable that the config file must be a bit deep into the source tree because it is loaded through the AMD system in the web app, which expects (and requires) any loadable code to be located within a base directory. Our base directory is */modules* and all configuration lives in the *config* subdirectory, so thus */kb/deployment/services/kbase-ui/modules/config*.

The deployment target directory can be provided to the tool, but is otherwise defined as */kb/deployment/services/kbase-ui*. This target directory has in the past been defined in the project configuration, but this doens't work in practice. For instance, if a deploy needs to be reconfigured, will the new configuration contain the deploy directory? And if so, what if it is different from the current deploy? There would be several other things to change -- the entire dist would need to be moved, permissions set up, and the web service reconfigured to point to the new location and then restarted. Rather, we should assume that for a given installation, reconfiguring will not result in the file moving, and that the script which calls the tool can define the utlimate destination for the dist.

## Instructions

In an environment in which kbase-ui has been installed, there will be some directory in which the source code has been installed. Within this there is a *build/dist* directory which contains the final product of the production build process. Within this directory you will find the *install* directory, which contains the installation and reconfiguration tool, and the *config* directory which contains a subset of the original configuration from the source (just enough to reconfigure the services.)

- If changes are required to one of the prebuilt deploy configs, do so in *dist/config/deploy*. 
- From within *dist/install* run the reconfiguration app:

```
node reconfigure TAG
```

where *TAG* is one of the supported deploy targets: ci, next, prod.

Additional deploy targets may be created simply by creating a new file within *dist/config/deploy* following the naming convention *deploy-TAG.cfg", where TAG is the deploy target tag you wish to use.


## All Tools

install
: Place the dist into the location of your choice

reconfigure
: After editing or replacing the local deploy.cfg, create a new set of kbase-ui yaml config files which depend on deploy.cfg

verify
: Verify that the installation is unmodified from the release; reports any differences
 