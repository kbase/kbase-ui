# KBase kbase-ui 1.7.0 Release Notes

This release brings two new features - a landing page for reports and ORCiD as an auth provider.

Data search now groups feature search (still unreleased) by parent genome. This was accomplished with search engine and search interface changes.

Fixes were brought to the job viewer & catalog, taxonomy widget for landing pages, and several internal improvements.

Two new in-progress features are available in CI only - dashboard2, a refactored dashboard with roughly the same shape but rewritten guts and featuring some narrative controls - deletion, sharing; system alert, which appear at the top (below the header) when active. 

## CHANGES

### NEW

dataview: report landing page [SCT-871]
auth: add ORCiD as auth provider [SCT-1016]
ui: add gitbook support for documentation [SCT-1101]

### REMOVED

none

### UNRELEASED

dashboard2: adds deletion, sharing, search over all narratives with backing service [SCT-709]
system alert/notification: initial implementation with backing service [SCT-713]

### IMPROVEMENTS

data-search: feature search groups by parent genome object [SCT-916]
data-search: searchapi improvements, improved error handling [SCT-644]
narrative-info: 
ui: improve feature switch support [SCT-1075]
auth2-client: conditionalize provider display [SCT-1075]
ui: new docker-based build and deployment support [SCT-1109]
jgi-search: many ui improvements [SCT-1145]

### FIXES

catalog: improve display of queueing and run time [SCT-279]
data-search: fix source, source, suspect fields id in genome index 2 [SCT-1062]
dataview/taxonomy widget: was not displaying correctly, species tree builder no longer worked [SCT-1024]
dataview: prevent breaking tables in header area [SCT-1038]
ui: prevent breaking page title [SCT-1075]
jobbrowser/catalog: fixes

## Dependency Changes

plugins:
kbase-ui-plugin-dataview: 3.7.3 -> 3.8.0
dashboard2: -> 0.1.7
auth2-client: 1.2.22 -> 1.3.0
catalog: 0.15.2 -> 0.18.1
report-viewer: 0.1.0 -> 0.1.3
ui-service: -> 0.1.0

libs:
kbase-ko-components-js: 0.5.3 -> 0.6.0
kbase-knockout-extensions-es6: 0.1.1 -> 0.1.4
kbase-common-es6: 0.1.0 -> 0.3.0
eonasdan-bootstrap-datetimepicker: 4.17.47
