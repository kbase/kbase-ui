# Install Tools for KBase UI

This directory contains tools to deal with the kbase-ui app in the context of the system it is working on. This directory will exist in the top level of the kbase-ui repo, and will also be installed into the kbase-ui application directory upon installation. This allows the tool to be used to reconfigure kbase-ui during runtime. The main use case is to reconfigure kbase-ui services.

## Topics

- pre-built, no need to npm install. in fact, the package.json will be removed from the dist.
- install.js: Place the dist into the location of your choice
- reconfigure.js: After editing or replacing the local deploy.cfg, create a new set of kbase-ui yaml config files which depend on deploy.cfg
- verify.js: Verify that the installation is unmodified from the release; report any differences
- 