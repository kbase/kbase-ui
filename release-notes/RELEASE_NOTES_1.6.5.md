# KBase kbase-ui 1.6.5 Release Notes

This release brings many small improvements and fixes including to landing pages, signup, the catalog and job viewer, and jgi search. The new, as yet unreleased, provenance widget was improved with support from the dagre library.  The beta Data Search tool brings an alpha level Genome Features tab - it is still missing significant features but does work.

Under the hood the build tools were updated as we move towards an improved, fully dockerized development workflow and deployment. A new integration testing framework was put in place to allow semi-automated integration testing for all plugins.


## CHANGES

### NEW

- dataview: added CompoundSet landing page
    - https://github.com/kbase/kbase-ui/pull/607

### REMOVED

n/a

### UNRELEASED

- dataview: updates to new provenance widget
    - https://github.com/kbase/kbase-ui/pull/600
- data-search: add genome feature search
    - https://github.com/kbase/kbase-ui/pull/601

### IMPROVEMENTS

- build and deploy improvements
- can disable menu items per deployment
    - https://github.com/kbase/kbase-ui/pull/593
- can use npm packages in build
    - https://github.com/kbase/kbase-ui/pull/594
- added integration test support for plugins
    - https://github.com/kbase/kbase-ui/pull/602
- auth2-client: improved signup ui (username entry more helpful)
    -  https://github.com/kbase/kbase-ui/pull/595
- catalog: catalog admin adds client groups column
    - https://github.com/kbase/kbase-ui/pull/608
- jgi-search: jgi search improved and released on menu
    - https://github.com/kbase/kbase-ui/pull/609

### FIXES

- auth2-client: fixed organization selector in signup form
    - https://github.com/kbase/kbase-ui/pull/595
- catalog: fixed catalog and job viewer with hardcoded app version
    - https://github.com/kbase/kbase-ui/pull/606

## Dependency Changes

- added dagre as dependency
    - https://github.com/kbase/kbase-ui/pull/600
