# KBase kbase-ui 1.7.1 Release Notes

## CHANGES

This release focuses on introducing the unreleased public search plugin, a minor improvement to the job browser to add a cancel button, ui improvements for data and jgi search from feedback, and important landing page fixes.

In the background, improvements were made to the unreleased alert and dashboard refactor and some improvements to the new docker-based deployment process (focussed on developer tools).

### NEW

- no new released features

### REMOVED

- remove knowledge engine prototype / demo widget from genome landing page

### UNRELEASED

- system alert plugin and service created [SCT-713]
- public data search [SCT-1235, SCT-1339, SCT-1340]
- dashboard2 improvements [SCT-709]

### IMPROVEMENTS

- ui improvements to data-search [SCT-1161] and jgi-search [SCT-1145]
- (internal) improvements to travis configuration [SCT-1075]
- (internal) add script to test docker hub images locally [SCT-1075]
- job browser allows cancellation [PTV-990]
- improve text on "about" page [PTV-1053]
- (internal) utilize gitlab config in local dev [SCT-1398]
- (internal) instrumentation (wip)

### FIXES

- fix genome landing page feature count [SCT-1325]
- fix genome landing page contig/feature/function browser

## Dependency Changes

plugins:

- typeview: 1.2.2 -> 1.3.0
- dataview: 3.9.0 -> 3.10.6
- dashboard2: 0.1.9 -> 0.2.1
- jgi-search: 0.35.1 -> 0.35.3
- catalog: 1.2.13 -> 1.2.15
- data-search: 0.19.4 -> 0.19.11
- ui-service: 0.2.1 -> 0.5.0
- public-search: -> 0.12.28
- dashboard3: -> 0.1.0

libs:

- "kbase-common-es6": "0.7.0" -> "0.10.5"
- "kbase-knockout-extensions-es6": "0.3.2" -> "0.6.14"
- "knockout" "3.5.0-rc" -> "3.5.0-rc2"
