# KBase kbase-ui 2.1.10 Release Notes

This release focuses on changes to support

## CHANGES

### NEW

- links to KBase info and documentation site updated to point to equivalent pages on new marketing and docs site
- kbase-ui and narrative are moving to kbase.us from narrative.kbase.us. As a consequence, kbase-ui will receive 
  requests for the old wordpress site. In order to keep these all from resulting in a "404 page", the "not found" view
  within kbase-ui now looks for the urls in the new marketing and doc sites and redirects if found; otherwise displays
  an improved message.
- removed code to handle production specially, particularly the backup cookie in user-facing code, and nginx routing for local development.

### REMOVED

none

### UNRELEASED

- dataview: sampleset - added mapping and spreadsheet tabs

### IMPROVEMENTS

none

### FIXES

- dataview: pangenome viewer removes sorting from two columns which crash when sorted

### DEPENDENCIES

none
