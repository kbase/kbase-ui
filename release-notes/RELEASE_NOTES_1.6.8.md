# KBase kbase-ui 1.6.8 Release Notes

This release brings several improvements to search, primarily KBase data search, but also the cross-linking between jgi and data search. Auto-running of search via the "q" query parameter also comes along for the ride, enabling links into search which we previously supported. A recent release of the search indexes without ui support, which broke the search interface, instigated the addition of default index handling.

Internally integration tests have been implemented, and encompass the primary plugins (login, dashboard, search, catalog, etc.). This enables basic sanity testing before merging PRs and releases. Still many integration tests to write.


## CHANGES

### NEW

- data-search, jgi-search: new navbar provides links between these two search interfaces, carrying the current search query. This is a new feature for two beta tools, so is likely to change. (https://github.com/kbase/kbase-ui/pull/630)

### REMOVED

n/a

### UNRELEASED

n/a

### IMPROVEMENTS

- data-search: internal, performance improvements 

- data-search: link scientific name to genome landing page

- data-search: move features tab, add prive/public filter (https://github.com/kbase/kbase-ui-plugin-data-search/pull/21)

- integration tests: integration testing is now conducted prior to all PR merges and releases; the set of integration tests is still low (14, and relatively shallow at that) but growing every week.

### FIXES

- data-search: add default index handling, avoids breaking the ui in the case of indexes released without support (https://github.com/kbase/kbase-ui/pull/626)

## Dependency Changes

- new knockout integration library
