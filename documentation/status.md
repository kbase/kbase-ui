---
---
# Current Issues

## search broken

If you see messages like `ERROR '/search-data.json' not found.` in the terminal in which you started `jekyll serve`, the search index needs to be built. Unfortunately, our theme's support for search is broken in several respects, and generating the search index will not help. Since search is not exposed, it is currently a harmless error.

## readme needs completion

> TODO :)

## `livereload` and node_modules

The `--livereload` option to `bundle exec jekyll serve --livereload` causes jekyll to watch the filesystem for changes, and when such occurs to rebuild the files and trigger a reload in the browser.

Since this is a branch of the repo, if you have worked with kbase-ui develop branch, you'll probably have generated ignored artifacts. When switching docker branches, these artifacts will remain in the filesystem, and the `livereload` feature will dig into node_modules and other artifact directories. For most directories, this is harmless, but for `node_modules`, an error will be triggered (and performance may suffer due to the large number of files to watch.)

The `livereload` option has a sister option `livereload_ignore` which is actually present in the `_config.yml` file, and specifies to ignore `node_modules`. Unfortunately, this option affects only what jekyll does when changed files are reported -- the file watcher still watches all files in the entire repo.

The only solution at this time is to remove the `node_modules` directory when working on the `gh-pages` branch, and restore it via `yarn install` when switching back to work on the `develop` branch.

This also affects the top level `build` directory, which may remain after a local build.