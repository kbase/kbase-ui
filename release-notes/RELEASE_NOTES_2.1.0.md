# KBase kbase-ui 2.1.0 Release Notes

This release adds public biochem search (was auth only before), improved sign-in page, improved plugin loading to fix a problem with plugin loading timing out over very slow networks.

Note that 

## CHANGES

- Added "New Narrative" to hamburger menu
- about page migrated to preact (from knockout + functional markup)
- removed webfonts, use font stack from ant design

### NEW

- sample landing page (unreleased, in development)

### REMOVED

- job browser kept at 1.1.4 (current 1.5.0) since this release precedes migration to ee2.

### UNRELEASED

- re landing page: envo support

### IMPROVEMENTS

- dataview: added workspace info to jsonview
- user profile: refactor to bimodal: view & edit via a button, layout improvements, other fixes.
- biochem search: now available without authentication; fixed reaction id, bootstrap table bug
- auth2 client: improve sign-in page; remove webfonts, use antd font stack

### FIXES

- fix timeout when loading plugin; add progressive loading indicators for long plugin loads
    - this problem probably arose for international users, for whom the connection to kbase became
        very slow; related to increased network traffic affecting chokepoints (due to pandemic)?
        or perhaps related to infrastructure changes either in kbase or elsewhere which reduced perf
        of certain routes? 

## Dependency Changes

none
