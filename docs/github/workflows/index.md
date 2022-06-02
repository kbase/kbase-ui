# GitHub Action (GHA) Workflow

This project uses GitHub Action workflows to

- run unit and integration tests,
- build an image containing the service,
- tag the image appropriately, and
- publish the image to GitHub Container Registry

This is accomplished with a set of 9 workflow files located in `./github/workflows`.

See:
 - [workflows](./workflows.md) for a description of the workflows,
 - [testing workflows](./evaluating.md) for a non-destructive technique to exercise workflows at GitHub,
