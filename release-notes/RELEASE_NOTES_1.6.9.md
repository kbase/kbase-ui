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

## Dependency Changes

kbase-ko-components-js: 0.4.0 -> 0.5.2
kbase-common-js: 2.15.2 -> 2.16.0
kbase-ui-plugin-typeview: 1.1.1 -> 1.2.2
kbase-ui-plugin-auth2-client: 1.2.19 -> 1.2.22
kbase-ui-plugin-jgi-search: 0.33.1 -> 0.33.3
kbase-ui-plugin-catalog: 1.2.3 -> 1.2.7
data-search: 0.13.3 -> 0.15.1

prototyping:
kbase-ui-plugin-narrative-info: 0.1.1
kbase-ui-plugin-test-lookup: 0.1.1