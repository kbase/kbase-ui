# KBase kbase-ui 2.1.7 Release Notes

The primary changes of interest to users are the fixes to the User Profile editor and the FBA and FBA Model landing pages.

In addition, the codebase underwent a significant refactoring, which should not result in any visible changes

## CHANGES

none

### NEW

none

### REMOVED

none

### UNRELEASED

- samples: added history tab
- dataview: add "related samples" tab to all landing pages (CI only)

### IMPROVEMENTS

- Many widgets refactored to (p)react. This resulted in a more uniform, smaller, and standardized codebase. This is part of the march toward refactoring to a compiled react version.
- dataview: SampleSet landing page improved
- dashboard: narrative search now filters by narrative (workspace) id
- fix alignment of login dropdown

### FIXES

- dataview: FBA and FBAModel landing pages fixed; also fixed ProteomeComparison, ContigSet, and Metagenome landing pages
- user profile: fixed several bugs in the user profile editor; improved layout

### DEPENDENCIES

js-yaml "3.13.1" -> "3.14.0"

several other updates to build dependencies.
