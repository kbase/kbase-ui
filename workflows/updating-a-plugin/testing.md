---
---
> Very out of date IGNORE for now

# Testing

We don't currently have a formal test harness for automated testing of plugins, so all of your testing will be by hand. Nevertheless, you do have the ability to manually verify that your plugin works against all kbase environments.

> Maybe we should rather call this "verification"

There are three basic levels of testing, each more onerous than the previous.

- Dev mode testing - use the kbase-ui dev build, with local plugin changes mounted into the image
- Dev build testing - use the kbase-ui dev build with local plugin changes checked in and released
- Prod build testing - use the kbase-ui prod build with local plugin changes released

## Manual Testing Process

For each environment (dev, ci, next, appdev, prod), do the following:

- start the kbase-ui container for that environment

  - ```bash
    make run-image env=ENV
    ```

  - where ENV is each of dev, ci, next, appdev, prod

- start the proxier for the matching environment

  - ```bash
    make run-proxier-image env=ENV
    ```

  - note that this ENV must match the first one

- Perform your tests

These steps are identical for each of the testing modes

## Dev Mode Testing

This is essentially an extension of the normal edit & reload process, with the twist that you should check all top features of the plugin for regression, and check against all deployment environments. 

You should perform this testing before releasing your plugin changes.

## Dev Build Testing

In this test mode, you have check in, merged, and released the plugin changes (because they passed the Dev Mode Testing above). You will have updated kbase-ui with the new plugin version, and rebuilt kbase-ui (as described in Preparing for Release.)

- push your code up to your repo
- issue a PR for the plugin
- either merge the PR yourself, or request a review and merge
- create a semver tag for the kbase plugin repo
- update the kbase-ui build files with the new semver:
  - config/app/dev/plugins.yml
  - config/app/prod/plugins.yml

You should perform this testing before a kbase-ui Pull Request which integrates your updated plugin.

If you feel confident in your changes, or they are trivial, you may skip this step and continue to Prod BuildTesting.

## Prod Build Testing

Finally, before issuing a PR for integrating your updated plugin into kbase-ui, you need to perform testing using the production build. This should be done sparingly, and usually just as a pre-release task, because the prod build can take several minutes. Fortunately, once the build is finished the same as above.

In addition to the tasks for Dev Build Testing:

- make the prod build 
- make the image using the prod build

Then perform your tests against each environment as described above.

## Future Testing Plans

First, there is nascent support for selenium-based integration testing in kbase-ui. Thus you can perform ad-hoc automated integration testing if you set up the tests by hand. We do not have this testing integrated into Travis or Jenkins, nor a method for integration of plugin tests into the kbase-ui testing apparatus.

See [Testing](testing.md) for more.

