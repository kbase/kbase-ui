# Configuration

This directory contains files necessary to configure kbase ui builds:

```services.yml`` is a YAML file containing definitions of all service endpoints which need to be known to the ui. Most service endpoints are defined as template strings in which the base url is placeholder which is populated at runtime by the deployment configuration (more about that later.)


```npmInstall.yml``` is a YAML file containing declarative instructions for installing each and every package brought into the project via bower. 


- ```builds``` - one file per named configuration set.
- ```deploy``` - classic KBase deploy configuration: service urls, target dirs, per KBase deploy environment.
- ```ui``` - ui build configurations
- ```bowerInstall``` - master file for importing bower packages into kbase module space.
