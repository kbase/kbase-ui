# KBase kbase-ui 2.3.3 Release Notes



## CHANGES

### NEW

- sample landing page "release"
- sample set landing page "release"

### REMOVED

- removed heartbeat service

### UNRELEASED

none

### IMPROVEMENTS

- add tooltips to sidebar menu
- changes to support improved plugins
- add build and runtime support for kbase-ui-lib (ts library)
- add search2 to about services; improve about-services
- improve error view
- improved error handling for plugin loading 

### FIXES

- fix feeds notification badge updating
- remove search1, add search2 to developer mode "About Services".
- improve alignment of deployment icon
- searchapi2 legacy now uses jsonrpc 1.1, not 2.0

### MAJOR DEPENDENCY CHANGES

- add kbase-ui-lib as a dependency, known as "ui-lib" in the package 
- swap pure-uuid for uuid
