---
---
# Releasing a Plugin

When a plugin is ready for deployment in a KBase environment, e.g. CI for review, or Prod for do accompany a kbase-ui release, it will need to be prepared and released.

This process is required whether releasing a plugin update to CI for review, to Prod for release, for for any other purpose in which the plugin needs to be integrated into kbase-ui for deployment.

## TL;DR

1. Do a fresh build of your plugin, if it hasn't been done already

    ```bash
    yarn build
    ```

    This will produce the file `dist.tgz` at the top of the plugin repo.

2. Push the plugin commits to your fork of the plugin
3. Issue a Pull Request against the upstream kbase repo.
4. When the PR is merged, create a release in semver format.
   1. The tag should be in the format `vMAJOR.MINOR.PATCH`, e.g. `v1.2.3`
   2. The comment should be `MAJOR.MINOR.PATCH`, e.g. `1.2.3`
5. In your local kbase-ui, update the version in `plugins.yml` to the version set above.
   1. Note that this version should be in the semver format without the `v` prefix.
6. Conduct a local build, and verify that it pulled in the correct version.

    ```bash
    make dev-start build-image=t
    ```

What you do next depends on the particular effort you are engaged in, but the most common next steps are:

- [releasing to ci](./releasing-with-kbase-ui-to-ci)
- [releasing to prod](./releasing-with-kbase-ui-to-prod)
