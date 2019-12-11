# KBase kbase-ui 2.0.0 Release Notes

## CHANGES

This is a major feature release, previously know by the feature branch in which it was developed "feature-refactor-to-crats".

The bump to version 2.0.0 is due primarily to the removal of dependencies which would be required in order to support non-iframed external plugins whose dependencies have disappeared from kbase-ui.

Overall, the kbase-ui changes are oriented at incorporating a refactoring of all external plugins to use a new plugin iframe format. The iframed plugins are described elsewhere, but suffice it to say that these changes include:

- new versions of all external plugins
- removal of some unused external plugins
- support for iframed plugins in the form of a widget and support libraries
- reduction in footprint of kbase-ui
- removal of dependencies (which had been maintained for specific plugins)

Other major changes include the rewriting of many internal components in ES6 (kbase-ui has accepted ES6 code for at least a year now), simplification of configuration, and movement of most documentation to kbase-ui-docs.


### NEW

none

### REMOVED

none

### UNRELEASED

none

### IMPROVEMENTS

- none

### FIXES

- none

## Dependency Changes

- none
