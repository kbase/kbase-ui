# KBase kbase-ui 2.1.11 Release Notes

This release adds a feature switch to enable the new "redirect to www" behavior when the ui is invoked with no url path, no ui path, and no token. The behavior is disable by default.

## CHANGES

### NEW

- hide "redirect to www" behind a new feature switch, redirect-to-www. This feature is disabled by default, and must be enabled in the environment configuration key "ui_featureSwitches_enabled".

### REMOVED

none

### UNRELEASED

- dataview sampleset: fix integration tests

### IMPROVEMENTS

none

### FIXES

none

### DEPENDENCIES

none
