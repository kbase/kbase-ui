# KBase kbase-ui 1.5.0 Release Notes

This is the first release of kbase-ui with Release Notes. It is also the first release to receive a git semver tag, which we are celebrating with release version 1.5.0.

Below we have created semver tags which might have been asigned to past releases had we been doing so. This is how we arrived at 1.5.0 for the current release.

| Version | Date       | Pull request to master                     |
|---------|------------|--------------------------------------------|
| 1.4.6   | 2017-06-22 | https://github.com/kbase/kbase-ui/pull/385 |
| 1.4.5   | 2017-06-17 | https://github.com/kbase/kbase-ui/pull/382 |
| 1.4.4   | 2017-06-16 | https://github.com/kbase/kbase-ui/pull/381 |
| 1.4.3   | 2017-06-15 | https://github.com/kbase/kbase-ui/pull/378 |
| 1.4.2   | 2017-06-15 | https://github.com/kbase/kbase-ui/pull/376 |
| 1.4.1   | 2017-06-13 | https://github.com/kbase/kbase-ui/pull/369 |
| 1.4.0   | 2017-06-13 | https://github.com/kbase/kbase-ui/pull/367 |
| 1.3.0   | 2016-09-16 | https://github.com/kbase/kbase-ui/pull/196 |
| 1.2.0   | 2016-04-20 | https://github.com/kbase/kbase-ui/pull/156 |
| 1.1.0   | 2016-03-03 | https://github.com/kbase/kbase-ui/pull/125 |
| 1.0.0   | 2016-02-24 | https://github.com/kbase/kbase-ui/pull/108 |

## HIGHLIGHTS

###  JGI Search

JGI Search is being launched in BETA form in this release.

### Jobs Browser

A jobs browser is being launcheed in this release.

### Integration of RESKE and JGI features into the dev and CI builds

RESKE integration adds limited data search (Genome, Assembly, reads, etc.) and Knowledge engine access. Although in prototype form, the RESKE search features are on their way towards production.

In support of developing and integrating this code, the ui build supports "allow" tags for conditional execution of code and thus ui-building. In addition, several extensions were added to knockoutjs to support ui elements.

JGI search is available in CI for review, but is still in active development.

### Landing Pages Repaired

Two landing pages specifically had fallen behind changes in the Narrative and deployed services. The FBA landing pages had failed due to remove of support for a production service, and were fixed by replacing those calls to corresponding new services. The Assembly landing page suffered from poor-performing graphs which were removed, and bad calls to service endpoints which were replaced.

### Performance and Reliability Improvements

Under the hood, a new module-caching system allows nearly all code to be pre-loaded when the initial ui becomes available in the browser. Although the initial load time might be longer on slow connections, subsequent access is faster because fewer network calls are required -| almost none for the sake of the ui. This is achieved by building a simple "virtual file system" (vfs) of javascript, css, and selected other files, and changing the module loader to first look in the vfs before attempting to load the file over the network from the server. This was inspired by a period of unstable network access, during which connections would be randomly dropped. When the ui encounters a failure to load a critical module, it may fail, so pre-loading modules increases reliabiltity in this sense.

### Catchup post-auth2

Post-auth2, some elements of the ui needed updating. The development process was markedly different and more complex, so the documentation was rewritten and reorgnaized to support virtual machine with proxying. A couple of landing pages, FBA and Assembly, had also fallen victim to changes in the KBase infrastructure during the auth2 upgrade, and were repaired. There is still much work to be done in this area, as the landing pages and Narrative data viewers do not share much code and should be brought into alignment.

### Documentation Updates

Due to new staff additions, in combination with many changes to the KBase instrastructure especially authentication and authorization, developer documentation needed a good refresh. New development workflows require a more complex setup, utiliziing a virtual machine hosting a proxy server in order to route ui, service, and auth requests to the corresponding endppoints in ci, next, appdev and prod.

## CHANGES

Each significant change should be noted below, with the accompanying JIRA ticket which it was associated with, if any.

If you, dear reader, notice anything missing or mistakeng, please file a ticket at ___ or ___ and the release notes will be corrected, in a future release.

> Note that the JIRA system is accessible only to KBase staff and affiliated persons, although Public JIRA issues, noted by the ```PUBLIC-``` prefix are publicly available.

### NEW
- added custom knockoutjs extensions, supporting more extensive use of knockout esp. in the new RESKE front end - [TASK-1021](https://kbase-jira.atlassian.net/browse/TASK-1021)
- Legacy data search removed (from menu, exists in codebase still) - [TASK-1051](https://kbase-jira.atlassian.net/browse/TASK-1051)
- new cached-module method for pre-loading modules in non-dev builds
  - slightly longer initial load time, but reduced latency and increased reliability
    for all subsequent module invocations (e.g. navigation)
- auth service added to the about-services panel

### REMOVED
- The Bulk Upload and Import plugin is being removed [SCT-XXX](https://kbase-jira.atlassian.net/browse/TASK-XXXX)

### UNRELEASED
- RESKE search plugin added for dev and CI builds. This new functionality provides a user tools for accessing the RESKE search service - [TASK-1051](https://kbase-jira.atlassian.net/browse/TASK-1051)
  - Resulted in prototype Narrative Browser and Data Search tools for dev and CI builds.
- RESKE Knowledge Engine plugin added for dev and CI builds. This new functionality is provided by a new plugin and a new widget for the landing pages - [TASK-1087](https://kbase-jira.atlassian.net/browse/TASK-1087)
- RESKE Knowledge Engine admin prototype added for dev and CI builds [TASK-1022](https://kbase-jira.atlassian.net/browse/TASK-1022)
- JGI search added to dev and CI builds, in hamburger menu - [TASK-921](https://kbase-jira.atlassian.net/browse/TASK-921)
- new landing page Provenance widget for dev and CI builds [TASK-966]https://kbase-jira.atlassian.net/browse/TASK-966)
- Prototype Feeds panel added, only enabled in dev and CI builds - [TASK-1090](https://kbase-jira.atlassian.net/browse/TASK-1090)

### IMPROVEMENTS
- documentation improvements - [TASK-986](https://kbase-jira.atlassian.net/browse/TASK-986)
  - development setup, plugin development, under auth2
  - example nginx files improved to support local auth2 Narrative + services
- knockout components can now be specified in plugin config and loaded at initial ui load
  - improves reliability
  - css sister file may be loaded at same time
- auth1 code removed to prevent inadvertent usage
- improve error handing in minification build step
  - syntax errors (or ES5 incompatibility) could cause silent failure
- most dev menu items removed from CI build
- improved narrative manager plugin
  - now uses the better generic clients from kb common
  - unmounts widget correctly
- should not rewrite url to messages panel when path not found [TASK-5258](https://kbase-jira.atlassian.net/browse/KBASE-5358)
- improvements to catalog [SCT-481](https://kbase-jira.atlassian.net/browse/SCT-481)
- new docker based developer workflow [SCT-148](https://kbase-jira.atlassian.net/browse/SCT-148)
- Improve titles of App detail pages [PTV-763](https://kbase-jira.atlassian.net/browse/PTV-763)

### FIXES

- fix and improve assembly landing page, aligning with Narrative - [TASK-852](https://kbase-jira.atlassian.net/browse/TASK-852)
- fba landing pages (Media, FBA Model) fixed - uses new api - [TASK-1081](https://kbase-jira.atlassian.net/browse/TASK-1081)
- data icons fixed - did not scale correctly
- new build config "allow" provides for deployment-specific tags which may
  be used to allow or omit certain features
  - created for and used by the new RESKE and Provenance features
- fix tab selection after tab close in reske search results [TASK-1051](https://kbase-jira.atlassian.net/browse/TASK-1051)
- downgrade numeral library 2.0.6 -> 2.0.4 to work around regression in it- [TASK-1025](https://kbase-jira.atlassian.net/browse/TASK-1025)
- improve title display so long titles don't bleed through the header right-side items 
- catalog would fail if authors property empty for any app [IMPL-242](https://kbase-jira.atlassian.net/browse/IMPL-242)