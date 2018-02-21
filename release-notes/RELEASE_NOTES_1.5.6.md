# KBase kbase-ui 1.6.0 Release Notes

Official introduction of the new search tool to the codebase, with the concurrent retirement of the reference data search tool.

The initial release is "soft" - the data search tool and simple search tool will not initially be shown in the menu, in order to allow for a period of testing for a few days. A follow-up release will include improvements, bug fixes, and release into the menu for data search (with simple search remaining a hidden tool for diagnostics.)

In terms of the UI there were a few improvements around the edges to support the incoming search tool, reduction of dependencies due to removal of the reference search ui.

The switch to uglify-es and the previous decision to banish IE11 means that ES6 is not acceptable in the codebase. The first introduction (and the impetus for the change) was the knockout es6-collections extension which will allow more efficient observable maps in components.

## CHANGES

### NEW

- new data search tool moving from dev to production mode: too many commits to mention!

- switch to uglify-es for ES6 compatibility: https://github.com/kbase/kbase-ui/commit/b34609142ba26e5cf428a7614873e76b98eba313

- add select2 as dependency (didn't end up using it, yet): https://github.com/kbase/kbase-ui/commit/46e1e0370215fcc0ea39cc52215ef9017edda319

### REMOVED

- the old reference search ui was removed from the codebase: 
  - removed from codebase: https://github.com/kbase/kbase-ui/commit/71d05ddfeb03b62f471899516c250ffb0d7b060b
  - removed from build: https://github.com/kbase/kbase-ui/commit/83e6e15cebf855afa2c497e72cb700719a016c9e
  - and a few others
  - added in a redirection from /search to #search

- several external library dependencies were removed: https://github.com/kbase/kbase-ui/commit/f0488793b1e636b6dbeb0bf7ddc5b70a84963977
  -  (q, postal) because they were only used by the old search ui


### UNRELEASED

- the data search tool will remain off the menu until a (short) period of testing and iteration completes, after which a minor release will expose it.

### IMPROVEMENTS

- improved common-js html generation https://github.com/kbase/kbase-ui/commit/f015d80b78980e75da98da350ed618b6d6cacda9
  - styles generation improved, adding the ability to use outer scope, inner selectors, pseudo elements

- minor improvements to knockout support: 
  - improved observable syncing behavior: https://github.com/kbase/kbase-ui/commit/5956ec6ae3c80fa092d9eec17d86905867e0a22d
  - added es6 collections: https://github.com/kbase/kbase-ui/commit/31b76cd82fd333aa289d3bbc6d8b8129a7cdccb8

- conservative update of client bower and build npm dependencies: https://github.com/kbase/kbase-ui/commit/b90cd7ac444e8d27eadae4012993f858a3f812c1
  - decreases technical debt

- menu system internals refactored: 
  - https://github.com/kbase/kbase-ui/commit/a92a3c0b603ce1175eaf6f09e6d287a14d5ec739
  - https://github.com/kbase/kbase-ui/commit/9848ee2596c4596904bd6c184ef2c639c1d52e29
  - and a few more
  - simpler configuration
  - primarily to allow the sidebar menu to operate like the hamburger - defined by plugins, enabled and arranged by the ui

- overall many improvements to the new data search tool; and minor to several others
  - itemized below

### FIXES

- fix backup cookie configuration reference (https://github.com/kbase/kbase-ui/commit/23a5cb27e41bb840b9b9772610dfc4bde2ccf4f0)

- switched from phantomjs to chrome headless for testing: https://github.com/kbase/kbase-ui/commit/50c16929f2d048679b87eb976ac64a66c4320c54
  - fixes issue with phantomjs not supported nearly as much of ES6 as modern browsers
  - in keeping with our decision to ditch IE11

- fix nagging issue with kbase data icons: https://github.com/kbase/kbase-ui/commit/2acb6443b05f378a1fdbbff0fa92120322a53287


## Dependencies

This section will improve in future release notes to note all external and internal dependency changes:

- plugins for prod build:
    - dataview: 3.4.0 -> 3.5.1
    - auth2-client: 1.2.8 -> 1.2.9
    - catalog: 1.2.0 -> 1.2.1
    - jobbrowser: 0.3.3 -> 0.3.4
    - jgi-search: 0.31.5 -> 0.31.6

    - simple-search: none -> 0.11.1
    - data-search: none -> 0.9.10

