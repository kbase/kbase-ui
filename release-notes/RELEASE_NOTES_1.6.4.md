# KBase kbase-ui 1.6.4 Release Notes

Build improvement works around bug in code inlining. The inlining bug in uglify-es results in incorrectly rewritten javascript during the "compilation" stage of the build. It was manifested in an error in the provenance widget. Reducing the inline level to 1 retains some of the benefits of inlining while avoiding the incorrect code construtions.

## CHANGES

### NEW

n/a

### REMOVED

n/a

### UNRELEASED

n/a

### IMPROVEMENTS

- reduced build size
    - https://github.com/kbase/kbase-ui/commit/176a892103d3141266509ee0c6d97d914d1e2fe9

### FIXES

- build fixes:
    - use inline level 1 for uglify-es to avoid bug in inlining
    - remove mapping from bootstrap full css
    - https://github.com/kbase/kbase-ui/commit/176a892103d3141266509ee0c6d97d914d1e2fe9

## Dependency Changes

- use numeral in build for better messages
    - https://github.com/kbase/kbase-ui/commit/8f8ae4fc357c2e145b0234cdc05868738bc03154
