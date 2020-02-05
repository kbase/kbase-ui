# KBase kbase-ui 2.0.0 Release Notes

## CHANGES

This is a major feature release, previously know by the feature branch in which it was developed "feature-refactor-to-crats".

The bump to version 2.0.0 is due primarily to the removal of dependencies which would be required in order to support non-iframed external plugins whose dependencies have disappeared from kbase-ui.

Overall, the kbase-ui changes are oriented at incorporating a refactoring of all external plugins to use a new plugin iframe format. The iframed plugins are described elsewhere, but suffice it to say that these changes include:

- new versions of all external plugins
- removal of some unused external plugins
- support for iframed plugins in the form of a widget and support libraries
- reduction in footprint of kbase-ui
- removal of dependencies (which had been maintained for specific plugins)

Other major changes include the rewriting of many internal components in ES6 (kbase-ui has accepted ES6 code for at least a year now), simplification of configuration, and movement of most documentation to kbase-ui-docs.


### NEW

- kbase-ui-plugin-react-profile-view: The user profile plugin has been rewritten as a React app (CRA) with Typescript. Functionally, it looks very different and also incorporates editing.

- kbase-ui-plugin-job-browser2: The job browser plugin has been rewritten as a React app with Typescript as well. It also looks and works very differently than the original version.

### REMOVED

- several unreleased or develop-time plugins were removed from the configuration, since it was deemed not worth porting them to the new architecture. This includes:
  - kbase-ui-plugin-vis-widgets
  - kbase-ui-plugin-dashboard2
  - kbase-ui-plugin-databrowser
  - kbase-ui-plugin-typebrowser
  - kbase-ui-plugin-datawidgets
  - kbase-ui-plugin-data-landing-pages
  - kbase-ui-plugin-shockbrowser
  - kbase-ui-plugin-jobbrowser
  - kbase-ui-plugin-ontology-widgets
  - kbase-ui-plugin-sdk-clients-test
  - kbase-ui-plugin-pavel-demo
  - kbase-ui-plugin-test-dynamic-table-widget
  - kbase-ui-plugin-tester
  - kbase-ui-plugin-example-gopherjs
  - kbase-ui-plugin-simple-sample
  - kbase-ui-plugin-narrative-finder
  - kbase-ui-plugin-ui-diagnostics
  - kbase-ui-plugin-narrative-info
  - kbase-ui-plugin-test-lookup
  - kbase-ui-plugin-report-viewer
  - kbase-ui-plugin-public-search
  - kbase-ui-plugin-dashboard3
  - kbase-ui-plugin-projects-mvp1
  - components
  - message

### UNRELEASED

- kbase-ui-plugin-re-landing-pages

### IMPROVEMENTS

- all plugins migrated to iframe architecture, including:
  - kbase-ui-plugin-typeview: 1.3.0 -> 2.2.0
  - kbase-ui-plugin-dataview: 3.11.4 -> 4.4.6
  - kbase-ui-plugin-dashboard: 2.5.4 -> 3.2.0 
  - kbase-ui-plugin-auth2-client: 1.5.6 -> 2.1.6
  - kbase-ui-plugin-jgi-search: 0.9.2 -> 1.0.0
  - kbase-ui-plugin-catalog: 1.3.2 -> 2.1.0
  - kbase-ui-plugin-data-search: 0.19.12 -> 1.1.0
  - kbase-ui-plugin-organizations: 0.15.96 -> 1.0.0
  - kbase-ui-plugin-biochem-search: 0.0.6 -> 2.0.1

- integration tests now cover all plugins (but not very deep for most), and there are improvements to integration test support

- simplified plugin release/distribution process

- generally the kbase-ui codebase is much smaller and simpler

- kbase-ui codebase generally refactored to ES6 classes over factories.

- gtag support fixes

### FIXES

This is the result of a major refactor, with many changes, many things broken then fixed, and so forth. The changes, however, did not specifically address existing reported issues.

## Dependency Changes

There have been many dependency changes. This is due to three primary causes:

- improvements due to the passage of time
- reaction to the relatively new practice of security reviews (npm, yarn, github)
- extraction of plugins in to iframes obviated the need of packages required to support them

### Development

#### npm

##### new 

- @wdio/cli: 5.18.6
- @wdio/dot-reporter: 5.18.6
- @wdio/jasmine-framework: 5.18.6
- @wdio/local-runner: 5.18.6
- @wdio/browserstack-service: 5.18.1
- @wdio/selenium-standalone-service: 5.16.10
- @wdio/spec-reporter: 5.18.6
- @wdio/sync: 5.18.6
- @wdio/testingbot-service: 5.16.10
- tar: 6.0.1

##### updated

- bluebird: 3.5.3 -> 3.7.2
- chalk: 2.4.2 -> 3.0.0
- eslint: 5.15.3 -> 6.8.0
- fs-extra: 7.0.1 ->  8.1.0
- glob: 7.1.3 -> 7.1.6
- grunt: 1.0.3 -> 1.0.4
- grunt-karma: 2.0.0 -> 3.0.2
- grunt-webdriver: 2.0.3 -> 3.0.0
- handlebars: 4.1.1 -> 4.7.3
- jasmine: 3.3.1 -> 3.5.0
- jasmine-core: 3.3.0 -> 3.5.0
- js-yaml: 3.12.1 -> 3.13.1
- karma: 4.0.1 -> 4.4.1
- karma-chrome-launcher: 2.2.0 -> 3.1.0
- karma-coverage: 1.1.2 ->  2.0.1
- karma-jasmine: 2.0.1 -> 3.1.0
- karma-webdriver-launcher: 1.0.5 -> 1.0.7
- lodash: 4.17.11 -> 4.17.15
- path-exists: 3.0.0 -> path-exists: 4.0.0
- puppeteer: 1.13.0 -> 2.1.1
- selenium-standalone: 6.16.0 -> selenium-standalone: 6.17.0
- selenium-webdriver: 4.0.0-alpha.1 ->  4.0.0-alpha.5
- simple-git: 1.107.0 ->  1.131.0
- underscore: 1.9.1 -> 1.9.2
- uuid: 3.3.2 -> 3.4.0
- webdriverio: 4.14.1 ->  5.18.6
- yargs: 13.2.2 -> 15.1.0

##### removed

- grunt-mkdir: 1.0.0
- grunt-regex-replace: 0.4.0
- grunt-shell: 3.0.1
- npm: 6.9.0
- wdio-dot-reporter: 0.0.10
- wdio-jasmine-framework: 0.3.8
- wdio-sauce-service: 0.4.14
- wdio-selenium-standalone-service: 0.0.12
- wdio-spec-reporter: 0.1.5
- sauce-connect-launcher: 1.2.4

### app deps

#### npm

##### new

- @kbase/ui-lib: 0.2.1-alpha.3
- @kbase/ui-components: 0.2.1-alpha.14
- semver-umd: 5.5.5

##### updated

- bluebird: 3.5.3 -> 3.7.2
- preact: 10.0.0-alpha.1 ->  10.3.0

##### removed

- ajv: 6.9.1
- dagre: 0.8.4

#### bower

##### new

_none_

##### updated

- bluebird: 3.5.3
- js-yaml: 3.12.1 -> 3.13.1
- kbase-common-es6: 0.10.13 ->  0.10.23
- kbase-ui-widget: 1.3.0 -> 1.3.1
- knockout-validation: 2.0.3 -> 2.0.4
- marked: 0.6.0 ->  marked: 0.6.3
- requirejs-text: 2.0.15 -> 2.0.16

##### removed

- blockui: 2.70
- comma-separated-values: 3.6.4
- d3: 3.5.17
- d3-plugins-sankey: 1.1.0
- datatables-bootstrap3-plugin: eapearson/datatables-bootstrap3-plugin#1.0.1
- datatables: 1.10.19
- file-saver: 1.3.4
- google-code-prettify: 1.0.5
- handlebars: 4.1.0
- highlightjs: 9.12.0
- jquery-ui: 1.12.1
- kbase-sdk-clients-js: 0.5.1
- nunjucks: 3.1.2
- plotly.js: 1.43.2
- regression-js: 2.0.1
- select2: 4.0.5
- select2-bootstrap-theme: 0.1.0-beta.10
- underscore: 1.9.1
