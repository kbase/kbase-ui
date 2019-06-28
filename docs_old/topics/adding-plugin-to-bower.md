# Bowerizing Your Plugin
When a kbase-ui plugin is ready to be integrated beyond the development environment it must be installable via the Bower javascript package manager. All bower packages should be registered with the bower online service. The bower registry simply associates the bower package name, a simple string, with a repository location. The bower registry really services the purpose of locating the source code for a package. 

## Updating the bower.json in the plugin

(skipping that for the moment, let us assume it is correct)

### Validate the bower.json (optional)

We have a little tool to validate a plugin bower.json. 

- in your dev directory (the directory containing kbase-ui and the plugin your are working on) clone the kbase-ui validation tool

```
git clone https://github.com/eapearson/kbase-ui-validator
```

- install it 

```
cd kbase-ui-validator
npm install
```

- run it 

```
node main.js ../<your plugin>/bower.json
```

## Transfer the plugin to a KBase repo

If you have never done this, you may want to experiment with doing the following procedures with the plugin in your own repo, and then transfer the repo to KBase and register it with Bower.

## Give it an initial release version

We use Semantic Versioning 2.0 for plugins. 

During initial development you should start with 0.1.0 and increment on 0.x.y. 

Before incorporation into the kbase-ui staging branch, it should be at 1.0.0.

We use fixed versions in the kbase-ui build, so the semantics don't affect the build, however the semver conventions should still be adhered to.

### Adding the release version

The release version is added as a git tag. Plugins just use a simple master branch model.

Release tags are added through the github web interface.

Here is how:

- On the main github page for the repo, click on the releases button (commit, branch, releases, contributor)
- Click on "Create new release" if this is the first one or "Draft new release" if not
- In "Tag version" give it a tag like v0.1.0
  - Prefix the semver string with a "v"
  - Choose a version greater than the most recent one
     - increment the third position for bug fixes
     - increment the second position if there are any function changes backwards compatible
     - increment the first position for major non-backwards compatible changes
- In the "Release title" enter the semver tag without the "v" prefix
- Optionally add release notes

### Alpha or Beta releases

It is advisable to utilize alpha or beta suffixes to major releases so that the build and test process can proceed along the normal distribution pipeline. Minor fixes or changes which have been well-tested do not need to use this process

## Register in bower

Once you have given a release tag to the plugin repo, you are ready to register it in bower.

```
bower register kbase-ui-plugin-<plugin name> https://github.com/kbase/kbase-ui-plugin-<plugin name>
```

If you are testing with your local repo change the target address to the appropriate personal account. Later you may transfer the repo from your personal account to the kbase account.

Bower will prompt you.

```
? Registering a package will make it installable via the registry (https://bower.herokuapp.com), continue? (Y/n) 
```

Simply answer "y" and the package will be registered in Bower. Easy enough.


### Oops, I want to unregister

You may need to unregister a bower module. For example, you may have performed test, development, or prototype registration against your own repo, and you are ready to transfer it to kbase.

Another common reason is that you need to change the name of the package. If the package has not bee used elsewhere other than kbase-ui, it is safe to change it.

Finally, a bower package may no longer be needed. Perhaps it was experimental, or has been merged with another package.

Bower will issue dire warnings when you attempt to unregister a package. This is a wise warning, because unregistering a commonly used package can cause global outages for developers and even production builds.

At kbase, there is very little risk of interruption. For one, we almost always follow an unregistration with a re-registration, since the purpose is to transfer the package to another repo. In addition, we have a low number of developers. Finally, our deployment builds are infrequent, and the chance of one of them overlapping with the few seconds that a package will be unregsitered is very low.

Here is how to do it:

```
bower login
bower unregister kbase-ui-plugin-<plugin name>
```

Yes, Bower does not require authentication to register a module, but does require such to unregister it. Bower authenticates through github.


## Update kbase-ui build config

Now, back at kbase-ui you will need to change the build config to incorporate the plugin into the kbase-ui build.

The plugin will need an entry in ```config/ui/dev/build.yml```, ```config/ui/dev/build.yml```, and ```config/ui/prod/build.yml``` in the plugin section:

```
    -
        name: <plugin name>
        globalName: kbase-ui-plugin-<plugin name>
        version: 0.1.0
        cwd: src/plugin
        source:
            bower: {}
```

This entry instructs the build app to use the globalName + version  to fetch the plugin via bower. The source: bower: {} property essentially acts as a flag to instruct the build tool to use bower as a fetching mechanism. (In theory options may be passed to bower via the value of the bower property, but we've never implemented that feature.)

You may want to test this in your dev/config first, or not.

You will want to perform a normal build and test cycle now to ensure that the bower registration succeeded, it points to the correct version.


### Updating kbase-ui with plugin changes

As the plugin changes over time, you will need to update the version property.

There is a particular beat to plugin development using bower.

- set up a development environment for making local changes to a plugin "linked" into a kbase-ui build
- when finished, commit the changes and push up to your fork of the plugin
- add an appropriate version tag to the plugin repo at github
- update the kbase-ui build configs (dev, ci, prod) with the new version
- build the ui (without linking) and validate the changes locally
- commit the kbase-ui changes, which are restricted to the build config
- push up to your fork of kbase-ui
- issue a pull request from your kbase-ui fork to the develop branch upstream kbase repo for kbase-ui
- the reviewer of the pull request (which may be you!) will test the pull request
- in addition the travis build and tests must succeed
- the pull request is merged
- a jenkins ci build is initiated
- the changes are verified in ci