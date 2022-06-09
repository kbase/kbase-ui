# KBase kbase-ui 2.6.4 Release Notes

This release focuses primarily on improvements to closing html injection opportunities.

## CHANGES

### NEW

none

### REMOVED

none

### UNRELEASED

none

### IMPROVEMENTS

- UIP-6: replace GHA workflows with improved, KBase-compliant workflows

### FIXES

- UIP-5: dataview landing pages: many small xss fixes or annotations
- UIP-5: annotate safe usage in kbase-ui
- UIP-7: data-search: xss tweaks, primarily annotations, removed (old) widget library as it is knockoutjs-based

### MAJOR DEPENDENCY CHANGES

- alpine linux 3.15 -> 3.16 
- npm dependencies:
    - add DOMPurify 2.3.8