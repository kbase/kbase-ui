---
---

# Architecture

In which we describe how the kbase-ui is built, runs, and is hosted.


The kbase-ui is a web app, composed of html, javascript, css, data files, image files, and many other assets. As a web app it can be used behind just about any type of web server. In order to use the web app, it must operate on a supported KBase host. Practically this means that it should operate behind a proxy server which itself operates on the KBase host. (These hosts are https://X.kbase.host, where X is ci, next, appdev, and narrative).

In deployments, KBase uses an nginx proxy front end and rancher to orchestrate kbase-ui and other services which operate to form a connected set of services.

For basic kbase-ui usage and local development, a special docker-compose configuration provides a proxy container as well as kbase-ui container to simulate this service configuration.

The requirements for them are simple: make, git, and docker.