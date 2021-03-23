# KBase kbase-ui 2.4.0 Release Notes

This release brings a release of the data-search plugin utilizing the search2 legacy api endpoint. This allows us to retire the search1, and the Elasticsearch 5 service, entirely.

## CHANGES

### NEW

- tooltips for sidebar menu
- data-search: refactor to search2/legacy api, add support for AMA

### REMOVED

none

### UNRELEASED

- ontology: linked samples, show inaccessible sample count
- samples: fix leaflet bug, port to jsonschema for field config, improve - public-search: refactor to search2/legacy api

### IMPROVEMENTS

- job-browser: switch to user profile for user search
- improve alignment of deployment env icon

### FIXES

- organizations: fix description field (PUBLIC-1521)
- job browser: fix user filter
- feeds: fix alert in sidebar menu

### MAJOR DEPENDENCY CHANGES

- updated many dependencies, removed unused ones
