# KBase kbase-ui 2.3.2 Release Notes

This is an unusual release.

During the rollout of v2.4.1, some users experienced plugin load and service connection issues. A fix to add cache-busting to the plugin url did not fix the issue. However, reverting to v2.3.1 did.

Therefore, this release picks up from v2.3.1, just updating the plugins to have parity with the current release. 

## CHANGES

### NEW

none

### REMOVED

none

### UNRELEASED

- ontology: linked samples, show inaccessible sample count
- samples: fix leaflet bug, port to jsonschema for field config, improve - public-search: refactor to search2/legacy api

### IMPROVEMENTS

- job-browser: switch to user profile for user search
- data-search: refactor to search2/legacy api, add support for AMA, improve error handling


### FIXES

- organizations: fix description field (PUBLIC-1521)
- job browser: fix user filter

### MAJOR DEPENDENCY CHANGES

none
