# KBase kbase-ui 1.6.9 Release Notes

This release primarily focuses on fixes and improvements to existing plugins. 

## CHANGES

### NEW

- [SCT-822] job browser refresh button

### REMOVED

none

### UNRELEASED

- [SCT-805] dev & ci: narrative info viewer prototype

### IMPROVEMENTS

- [SCT-630] improve username warning and error detection during signup
- jgi-search, data-search: improve search history behavior and nav buttons
- data-search: sync to latest searchapi changes
- [SCT-822] job browser performance improvements

### FIXES

- [SCT-744] spec viewer was mangling type links
- [SCT-744] module link didn't support link without version
- [SCT-820] add browser capability test to catch FF < 45
- [PTV-1053] remove service status from production menu
- add missing read object icon

## Dependency Changes

- kbase-ko-components-js: 0.4.0 -> 0.5.2
- kbase-common-js: 2.15.2 -> 2.16.0
- kbase-ui-plugin-typeview: 1.1.1 -> 1.2.2
- kbase-ui-plugin-auth2-client: 1.2.19 -> 1.2.22
- kbase-ui-plugin-jgi-search: 0.33.1 -> 0.33.3
- kbase-ui-plugin-catalog: 1.2.3 -> 1.2.7
- data-search: 0.13.3 -> 0.15.1
- kbase-ui-widget: 1.2.1 -> 1.3.0
- kbase-common-es6: -> 0.1.0
- kbase-knockout-extensions-es6: -> 0.1.1

prototyping:

- kbase-ui-plugin-narrative-info: 1.1.3
- kbase-ui-plugin-test-lookup: 0.1.1

external sources:

- highlightjs: 9.10.0 -> 9.12.0
- js-yaml: 3.10.0 -> 3.11.0
- numeral: 2.0.4 -> 2.0.6
- momentjs: 2.20.1 -> 2.22.1
- marked: 0.3.12 -> 0.3.19
- knockout: 3.5.0-beta -> 3.5.0-rc