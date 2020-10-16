# KBase kbase-ui 2.2.0 Release Notes

This release brings one new feature, a new field for signup, several improvements to the unreleased sampleset, taxonomy, and ontology landing pages, and a fix for Organizations.

In addition, there are several notable internal changes: The codebase is being incrementally refactored to Typescript, from Javascript; bower is no longer used for any core depenencies (plugins may still use it)

## CHANGES

### NEW

- auth2-client: add new signup field for "How did you hear about KBase?"

### REMOVED

none

### UNRELEASED

- sampleset: spreadsheet supports search, filter, sort
- taxonomy: generic implementation places all per-taxonomy dependency into one file
- taxonomy: add SILVA support
- ontology: generic implementation places all per-ontology dependency into one file

### IMPROVEMENTS

- many modules converted to Typescript
- build simplified and updated to support Typescript
- narrativemanager: improve display of slow or broken narrative
- add focus and blur to integration tests
- bower no longer used for any core dependencies

### FIXES

- organizations: fix search and sort for narrative, app, member lists (needs further workk)

### DEPENDENCIES

- bower: removed
- npm: bower dependencies became npm dependencies
- internal: some bower dependencies simply copied into codebase
