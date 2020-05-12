# KBase kbase-ui 2.1.2 Release Notes

This is a bugfix release, focusing on the proper handling of the backup cookie in some circumstances.

During signup the backup cookie should have been set, but had regressed in the Feb 2020 release of the refactored kbase-ui. Also cookie repair was put in place for some corner cases.

## CHANGES

none

### NEW

none

### REMOVED

none

### UNRELEASED

- continued work on the unreleased re landing pages and sample viewer

### IMPROVEMENTS

- repair cookies: if backup cookie required but missing and have session cookie, create backup cookie; if only backup cookie, remove it.

### FIXES

- auth plugin: set backup cookie after signup (a regression)

## Dependency Changes

none
