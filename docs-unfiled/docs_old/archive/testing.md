# Testing

## UI Testing

UI Testing utilizes the webdriverio javascript library to provide the testing framework. It operates equivalently to karma in that it integrates the testing integration (jasmine, etc.) and also provides webdriver integration. The webdriver component talks to a selenium server, which must be running, which in turn talks to the browsers.

### Local

install selenium-standalone via npm locally

after npm-installing it locally (npm install or make init)

./node_modules/selenium-standalone/bin/selenium-standalone install

this installs the web browser drivers

etc.

run selenium-standalone

./node_modules/selenium-standalone/bin/selenium-standalone start


NEXT: need to incorporate local server with reverse proxying and selenium startup
