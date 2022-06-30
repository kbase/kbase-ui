# KBase kbase-ui NEXT Release Notes

none

## CHANGES

### NEW

none

### REMOVED

none

### UNRELEASED

none

### IMPROVEMENTS

none

### FIXES

- UIP-10: feeds plugin: address any potential xss exposures, no user visible changes
- UIP-11: auth plugin: address any potential xss exposures; no user visible changes, but some functionality fixes (not reported)
- UIP-12: jgi-search plugin: addresses any potential xss exposures
- UIP-13: xss finishing work - auth2-client, just fix title
- UIP-13: catalog - get a foothold with preact; replacing all that jquery append() usage addresses potential xss vulnerabilities
- UIP-13: typeview - update dependencies, make html binding more secure
- UIP-13: dataview - update dependencies, make html binding more secure
- UIP-13: public-search - update dependencies, make html binding more secure, fix result selection for copy
- UIP-13: organizations - fix dependency issue, internal updates
- UIP-14: dataview - refactor genome landing page for efficiency; new layout in tabs
- UFI-18: auth2-client: fix case of sign-in while auth2/signedout view is showing; some language edits

### MAJOR DEPENDENCY CHANGES

none
