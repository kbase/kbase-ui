# KBase kbase-ui 2.4.0 Release Notes

This release brings a release of the data-search plugin utilizing the search2 legacy api endpoint. This allows us to retire the search1, and the Elasticsearch 5 service, entirely.

## CHANGES

### NEW

- tooltips for sidebar menu

### REMOVED

none

### UNRELEASED

- ontology: linked samples, show inaccessible sample count
- samples: fix leaflet bug, port to jsonschema for field config, improve - public-search: refactor to search2/legacy api

### IMPROVEMENTS

- job-browser: switch to user profile for user search
- improve alignment of deployment env icon
- add tooltips to sidebar menu items
- update narrative navigator sidebar menu item with "Navigator" and navigator-like icon
- data-search: refactor to search2/legacy api, add support for AMA
- tools improvements: switch from yarn to npm, add integration test timeout parameters for make task,

### FIXES

- organizations: fix description field (PUBLIC-1521)
- job browser: fix user filter
- feeds: fix alert in sidebar menu

### MAJOR DEPENDENCY CHANGES

- updated many dependencies, removed unused ones
- remove pure-uuid (duplicate uuid library), replace usages with uuid.
