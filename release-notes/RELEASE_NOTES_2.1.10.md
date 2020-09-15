# KBase kbase-ui 2.1.10 Release Notes

This release focuses on changes to support the new outreach (www.kbase.us) and documentation sites (docs.kbase.us). These changes include update links, and a new "redirect" behavior. The latter, described below, is designed to accommodate the move from narrative.kbase.us to kbase.us, and the consequent urls into kbase-ui which previously would have landed on the outreach site. That move has not happened yet, but the new behavior is still present.

This release additionally includes fixes to a pangenome viewer and orgs, as well as work under development for samples and search2.

## CHANGES

### NEW

- links to KBase info and documentation site updated to point to equivalent pages on new marketing and docs site
- kbase-ui and narrative are moving to kbase.us from narrative.kbase.us. As a consequence, kbase-ui will receive 
  requests for the old Wordpress site. In order to keep these requests from resulting in a "404 page", the "not found" view within kbase-ui now looks for the urls upstream in the new marketing and doc sites and redirects to them if found; otherwise displays an improved message.

### REMOVED

none

### UNRELEASED

- dataview: sampleset - added mapping and spreadsheet tabs
- data-search: a future version of data-search, which works against search2, is included and 
  can be found in the developer menu.

### IMPROVEMENTS

- support installing a plugin more than once
- integration test improvements

### FIXES

- dataview: [PTV-1527, PUBLIC-1207, PUBLIC-1208] pangenome viewer - remove sorting from two columns which crash when sorted
- orgs: [PTV-1537, PUBLIC-1353] fix link handling for invitations to private orgs; fix display of > 100 orgs.
- user profile: [PTV-1519, PUBLIC-1242] fix editor bugs: affiliation, position, state fields had problems - these and related issues were fixed.

### DEPENDENCIES

none
