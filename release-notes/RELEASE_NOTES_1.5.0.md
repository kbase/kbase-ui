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

### Integration of RESKE and JGI features into the dev and CI builds

RESKE integration adds limited data search (Genome, Assembly, reads, etc.) and Knowledge engine access. Although in prototype form, the RESKE search features are on their way towards production.

In support of developing and integrating this code, the ui build supports "allow" tags for conditional execution of code and thus ui-building. In addition, several extensions were added to knockoutjs to support ui elements.

JGI search is available in CI for review, but is still in active development.

### Landing Pages Repaired

Two landing pages specifically had fallen behind changes in the Narrative and deployed services. The FBA landing pages had failed due to remove of support for a production service, and were fixed by replacing those calls to corresponding new services. The Assembly landing page suffered from poor-performing graphs which were removed, and bad calls to service endpoints which were replaced.

### Performance and Reliability Improvements

Under the hood, a new module-caching system allows nearly all code to be pre-loaded when the initial ui becomes available in the browser. Although the initial load time might be longer on slow connections, subsequent access is faster because fewer network calls are required -| almost none for the sake of the ui. This is achieved by building a simple "virtual file system" (vfs) of javascript, css, and selected other files, and changing the module loader to first look in the vfs before attempting to load the file over the network from the server. This was inspired by a period of unstable network access, during which connections would be randomly dropped. When the ui encounters a failure to load a critical module, it may fail, so pre-loading modules increases reliabiltity in this sense.

### Catching up with auth2 changes

Post-auth2, some elements of the ui needed updating. The development process was markedly different and more complex, so the documentation was rewritten and reorgnaized to support virtual machine with proxying. A couple of landing pages, FBA and Assembly, had also fallen victim to changes in the KBase infrastructure during the auth2 upgrade, and were repaired. There is still much work to be done in this area, as the landing pages and Narrative data viewers do not share much code and should be brought into alignment.

## NEW
- added custom knockoutjs extensions 
- Legacy data search removed (from menu, exists in codebase still)
- new cached-module method for pre-loading modules in non-dev builds
  - slightly longer initial load time, but reduced latency and increased reliability
    for all subsequent module invocations (e.g. navigation)
- auth service added to the about-services panel

## UNRELEASED
- RESKE search and Knowledge Engine plugins added for dev and CI builds
  - also added to the hamburger and sidenav and only enabled for those envs.
- RESKE-based Narrative Browser and Data Search thus added for dev and CI builds.
  - Prototype, but have become an expected new feature
- JGI search added to dev and CI builds, in hamburger menu
- new landing page Provenance widget for dev and CI builds
  - conditionally appears in landing page in thi the dev and ci build
- Prototype Feeds panel added, only enabled in dev and CI builds

## IMPROVEMENTS
- documentation improvements
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

## FIXES

- fix and improve assembly landing page, aligning with Narrative 
- fba landing pages (Media, FBA Model) fixed - uses new api
- data icons fixed - did not scale correctly
- new build config "allow" provides for deployment-specific tags which may
  be used to allow or omit certain features
  - created for and used by the new RESKE and Provenance features
- fix tab selection after tab close in reske search results
- downgrade numeral library 2.0.6 -> 2.0.4 to work around regression in it
- improve title display so long titles don't bleed through the header right-side items 