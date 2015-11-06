# Managing dependencies for KBase UI
For managing JavaScript package dependencies, we use [Bower](http://bower.io/). This (along with [NPM](https://www.npmjs.com/)) is a common JavaScript package manager that cuts down on repo size and code maintenance. It also lets you specify Github repos for a dependency location. We use that feature pretty extensively in KBase.

Currently, we include a few types of dependencies. Module dependencies that are necessary for the UI site to be built and to run are included via Bower. More programmatic dependencies needed for compiling code and running tests are mostly NodeJS modules. These are included via NPM. It's good practice to stick with one or the other as much as possible.

## Installing dependencies
Once dependencies are included, you can install them all with the simple command
```
bower install
```
or
```
npm install
```

## Adding dependencies
There are two similar commands

If it's needed for running
```
bower install your_dependency --save
```

If it's needed for development and testing, but not at runtime
```
bower install your_dependency --save-dev
```

Both of these go against the Bower registry for common packages.

For installing KBase plugins (**also for third party KBase methods, possibly later**), you can just specify the Github repo by its organization (or user), repo name, and branch, with the following pattern:
```
user/repo#branch
```
For example, kbase-common-js is included as
```
bower install kbase/kbase-common-js#master --save
```

You can also directly edit the `bower.json` file, but that isn't recommended.
