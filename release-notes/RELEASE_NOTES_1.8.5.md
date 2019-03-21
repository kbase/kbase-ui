# KBase kbase-ui 1.8.5 Release Notes

## CHANGES

This release brings new features (job queue tool in Catalog, orgs list in user profile, upcoming biochem search), fixes (user profile, account editor, organizations), and general housekeeping (dependency updates).

### NEW

user-profile: now lists apps the given user is a member of
job queue panel - available in the Catalog Tool at #catalog/queue
organizations: app association now available

### REMOVED

none

### UNRELEASED

biochemistry search: new plugin, will be "integrated" with other search tools as another tab

### IMPROVEMENTS

organizations: performance, usability, styling, and layout improvements; app association

### FIXES

auth & user-profile: fix affiliations section of the user profile editor and display; was due to failure to validate affiliation fields, which allowed an empty
affiliation to be entered.

## Dependency Changes

knockout: 3.5.0-rc2 -> 3.5.0 (finally!)
preact: -> 10.0.0-alpha.1
minor version bumps for several npm packages
