> Very out of date IGNORE for now

# Deploying updated plugin

When you have completed a round of changes to the plugin and it is ready for review on CI, you will need to update the plugin repo and issue the changes into the CI environment. Typically this will involve two sets of updates -- first a PR for your plugin changes, which results in a new version; secondly a PR for the new plugin version in kbase-ui, which will result in a new release in CI.

- commit all changes
- push changes to your fork
- issue a PR for the kbase plugin
- after the PR is accepted, a new version will have been issued
- update the plugin version in your kbase-ui plugins.yml config for both dev and ci (and prod if this is ready for release)
- rebuild kbase-ui and verify that the build works, and that the changes are present
- commit and push your kbase-ui changes (which will just be configuration changes to bump up the version for your plugin) to your kbase-ui fork
- issue a PR for this change
- the PR will be accepted and kbase-ui will be redeployed into CI

> If the PR is in the early stages, it may still be in your personal github account; if this is so clearly you can skip the PR process for the plugin, and issue the new release version yourself. Don't worry —  when you transfer the repo to the kbase account, all commits and release tags are retained.
