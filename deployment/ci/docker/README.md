# Docker Deployment Directory

This directory is to be copied to the docker image under /kb.
The resulting directory strucuture will be

```
kb
  deployment
    bin
      entrypoint.sh
    conf
      deployment_templates
        config.json.j2
        nginx.conf.j2
      README.md
```

entrypoint - the entry point script is provided in kb/deployment/bin/entrypoint.sh

configuration templates - upon running the entrypoint script will attempt to build
the ui deployment config file. Therefore you will find no configuration file in
the kb/deployment/conf directory. Rather you will find configuration templates.

- config.json.j2 - provides a template for kbase-ui deployment configuration
- nginx.conf.j2 - provides a simple file-serving template for nginx
