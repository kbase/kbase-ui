# KBase kbase-ui 1.5.3 Release Notes

The primary user-facing change is that IE11 is now considered non-compliant and results in the "unsupported browser" message. Accompanying explanations can be found in the KBase doc sites [Suppored Browsers page](http://kbase.us/supported-browsers/).

The App Catalog now allows non-developers to select the version type (release, beta, dev).

There were improvements to the developer tools.

## CHANGES


### NEW

- IE 11 is now considered a non-compliant browser [SCT-518](https://github.com/kbase/kbase-ui/commit/0e6e5120c699dbd47ae55e24c7b26e277f44eacb)


### REMOVED

n/a

### UNRELEASED

- jgi search and kbase data search are still included by not exposed in the ui; they are still being tested and finished up.

### IMPROVEMENTS

- improved to developer and deployment workflow by separating the ui container into just ui and just proxy.
- catalog update - version select for non-devs [SCT-423](https://github.com/kbase/kbase-ui/commit/956e0986260d852f836c57acae2eee9daac2f581)
- update to latest knockout library (3.4.2 -> 3.5.0)


### FIXES

- fix error triggered by IE11 [SCT-518](https://github.com/kbase/kbase-ui/commit/43e9cd8535777bc30db31891d4269555a70c9ddd)
- updated jgi-search to handle not-found jobs better [SCT-123](https://github.com/kbase/kbase-ui/commit/95c27152a3eb0eaae7da82aa470921755cb2b69a)