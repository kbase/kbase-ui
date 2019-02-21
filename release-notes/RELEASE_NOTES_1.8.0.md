# KBase kbase-ui 1.8.0 Release Notes

## CHANGES

### NEW

- organizations [SCT-1612]
- feeds plugin [many small tickets]
- feeds live update in sidebar nav [n/a]

### REMOVED

### UNRELEASED

### IMPROVEMENTS

- dataview []
- google analytics (collect) improvements [no ticket] [85e206b64b8fc12c9fcb9d055d5b33a1fca63cb3]
- ui: add support for relation engine service [?][9c5ef020211213f309c94831a7c973e9250dbde4]
- public search: make auth-only (no longer public), add detail view, improve narrative viewer; fixes, improvements; note, still not released [SCT-1522, SCT-1523, SCT-1535]

### FIXES

- ui: fix narrativemanager to properly handle the app parameter [n/a] [b46a78d3cf64c4633fa37f648a4ac43e435f6d65]
- ui: fix rest-based service check [n/a] [a72f7cdca5555336b63c98a3ebe600c6bd9756a9]
- ui: safari 10 compatibility [n/a] [cec75773f8fa9aced6753c04d6731da8c2d20049]
- auth2 client, login widget: fix error panel, handle unlink error [n/a]
- user profile: job title, narratives [n/a]

## Dependency Changes

plugins:

dataview 3.10.6 -> 3.11.2
dashboard 2.5.3 -> 2.5.4
auth2-client 1.3.6 -> 1.3.9
user-profile 1.4.4 -> 1.5.1
feeds 0.3.1 -> 0.9.0
public-search: 0.12.29 -> 0.13.6
organizations -> 0.15.55


libs:

bower
bluebird 3.5.1 -> 3.5.3
bootstrap 3.3.7 -> 3.4.1
datatables 1.10.16 -> 1.10.19
handlebars 4.0.11 -> 4.1.0
js-yaml 3.11.0 -> 3.12.1
kbase-ko-components-js 0.6.0 -> 0.6.2
kbase-knockout-extensions-es6 0.6.14 -> 0.6.16
kbase-common-js 2.18.0 -> 2.18.1
kbase-common-es6 0.10.5 -> 0.10.11
marked 0.5.0 -> 0.6.0
moment 2.22.1 -> 2.24.0
nunjucks 3.0.0 -> 3.1.2
plotly.js 1.33.1 -> 1.43.2
regression-js 1.4.0 -> 2.0.1
underscore 1.8.3 -> 1.9.1

- many npm build tool libs updated

docker:

- alpine 3.8 -> 3.9
