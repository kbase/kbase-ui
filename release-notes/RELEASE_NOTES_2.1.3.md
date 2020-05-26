# KBase kbase-ui 2.1.3 Release Notes

The primary user-facing change in this release is for the job browser, which now operates against the job browser bff dynamic service, which in turn operates against the ee2 service. There were several ui improvements as well.

Internall, the ui has undergone a migration from knockoutjs to preact components. Other than being more familiar to developers, the preact (and htm) component stack is better maintained.

## CHANGES

none

### NEW

none

### REMOVED

none

### UNRELEASED

- sampleview: sample landing page added sample metadata grouping and map vis, scrolling w/in tabs
- re-landing-pages: add nav buttons to graph

### IMPROVEMENTS

- job-browser2: now operates against ee2, with many updates to support ee2 changes from metrics/njs; several bug fixes and improvements
- refactor all kbase-ui knockoutjs components to preact
- update image to alpine 3.11

### FIXES

none

## Dependency Changes

### package.json:

updated: see https://github.com/kbase/kbase-ui/compare/master...kbase:develop#diff-b9cfc7f2cdf78a7f4b91a753d10865a2

removed:
@kbase/ui-components
@kbase/ui-lib

### bower.json:

updated: see https://github.com/kbase/kbase-ui/compare/master...kbase:develop#diff-0a08a7565aba4405282251491979bb6b

removed:
bower-knockout-mapping
enosdan-bootstrap-datetimepicker
kbase-ko-components-js
kbase-knockout-extensions-es6
kbase-common-js
kbase-service-clients-js
kbase-ui-widget
knockout
knockout-arraytransforms
knockout-projections
knockout-switch-case
knockout-validation
moment
nunjucks (resolution)
