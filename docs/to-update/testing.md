# Testing KBase UI code

Tests are good for you! A unit testing framework is now available. Integration testing is more challenging but will come later. For now, this document focuses on unit testing.

# Jasmine for writing tests

Our unit testing framework is built around the Jasmine package. You can read the docs and tutorials [here](http://jasmine.github.io/2.3/introduction.html), but some introductory details follow. You can also check out tests in the test/spec directory from the root of this repo.

Jasmine is a behavior-driven tool for JavaScript testing. It has built-in support for various different packages and common libraries, as well as features that allow function mocking and AJAX call simulation. In the end, though, you're still writing JavaScript code in your tests.

Your test suites will be composed of test "specs" - individual tests that should examine one functional piece of the module you're testing. We have it designed so that a single suite should correspond with a single module. These can all be found under test/spec in the root of this repo, and should roughly follow the same directory structure as the original source code location for clarity and consistency.

Each suite works in a couple components.  

**1. Load the module(s) you're testing using RequireJS.**

We use RequireJS to load modules. The set of paths and namespaces is available in functional-site/js/require-config.js (and possibly could be published elsewhere). As an example, to load the kbaseConfig module for testing, this syntax is used to wrap a test suite:

<!-- note that this is the github code markdown extension -->
```JavaScript
'use strict';
define(['kb.config'], function(Config) {
    ... specs go here ...
});
```

**2. Use ```describe``` to start the suite.**

Next, we use Jasmine's ```describe``` function to start the suite.

```JavaScript
'use strict';
define(['kb.config'], function(Config) {
    describe('The KBase Config object', function() {
        ... specs go here ...
    });
});
```

You can have multiple ```describe``` statements in a single file. Just note that they do not interact with each other, so any variables you declare in one will not be available in the other.

**3. Use ```it``` to define a test.**

Finally, individual test specs are just calls to the Jasmine's ```it``` function. Like ```describe```, these take a descriptive string, and a function that runs the test.

```JavaScript
'use strict';
define(['kb.config'], function(Config) {
    describe('The KBase Config object', function() {
        it('should have a Workspace url', function() {
            var wsUrl = Config.hasItem('services.workspace.url');
            expect(wsUrl).toBe(true);
        });
    });
});
```


There are a few things going on inside of the spec. The main testing portion is that ```expect``` function, which takes a value called the "actual." This gets chained with a Matcher function that takes the expected value. In the example above, we ```expect``` the wsUrl (actually returned from the function) simply to be defined (in the JavaScript definition of the term).

There are a large number of Matcher functions available for most cases, and they can be prepended with a ```.not.``` (e.g. ```expect(false).not.toBe(true)```) You can see these (with examples!) in the Jasmine Documentation [here](http://jasmine.github.io/2.3/introduction.html#section-Included_Matchers)

Any variables or constants you might need across tests can be defined outside the tests (i.e., before any 'describe's). The scoping rules mean that each spec has access to the global variables that are defined in the same file but outside the tests.

```JavaScript
'use strict';
define(['kb.config'], function(Config) {
    var wsUrlConfig = 'services.workspace.url';
    var correctWsUrl = 'https://kbase.us/services/ws';

    describe('The KBase Config object', function() {
        it('should have a Workspace url', function() {
            expect(Config.getItem(wsUrlConfig)).toBe(correctWsUrl);
        });
    });
});
```


That's pretty much it. You can certainly do more complex things, like simulate click events and DOM modification, but this is intended for an introduction. There are a few test suites available in test/spec, and more will come.

# Karma for running tests

Now that you have a number of tests written, they need to be run! The tool we use for running tests is called Karma [see homepage](http://karma-runner.github.io/0.13/index.html)

Karma is a test running framework - that means it handles starting up a web server, web browser, and populates the test page with all necessary files, then runs the test. **This is already configured for you.** There's nothing you should need to do here, but this part of the document describes the process used.

Karma uses a common conf.js file (commonly `karma.conf.js`). For us, that lives inside the test directory. This configuration file tells Karma what files need to be included in the web server, whether they need to be automatically loaded as part of the test page, and where the test files are. Fortunately, most of this is templateable. However, since most of our external components are installed by Bower, and that can lead to some inconsistencies in what gets installed, we had to include most of those manually. If you need to include a new external dependency, you'll likely have to do the same. Otherwise, all .js files in the src directory are included, and .js files under test/spec are treated as tests.

The configuration is currently set to just test against PhantomJS - a headless, WebKit scriptable browser. Versions of Chrome and Firefox will eventually be added to the testers, especially for automation. For automation, this repo uses [Travis-CI](https://travis-ci.org/kbase/ui-common) to automatically run tests during a Github pull request. This then emits test coverage reports to [Coveralls](https://coveralls.io/github/kbase/ui-common) to see how much of your code is covered by tests.

Internet Explorer and Safari are, unfortunately, unavailable on Travis-CI as of this writing. There are plugins available for Karma that allow those to be used locally (look up [karma-ie-launcher](https://www.npmjs.com/package/karma-ie-launcher) and [karma-safari-launcher](https://www.npmjs.com/package/karma-safari-launcher)), but will not be included in KBase anytime soon.

Finally, Karma is configured to automatically report test coverage. When running locally using the commands below, an HTML directory with test results and coverage will be automatically generated for you to browse at build/test-coverage/html (see below for instructions on viewing). When run on Travis-CI, a different file is made that gets passed along to Coveralls.

# Running tests with Grunt or Make

We use Grunt as a general task runner. You can check out the Gruntfile.js in the root of ui-common for the available functions, but the testing specific ones are below. Just run these from the command line. If you haven't already, you'll need to run `make` first to get all dependencies together.

`grunt test` does a single test iteration that generates the coverage output.  
`grunt develop` sets up a constant tester that watches all directories for changes. Adding a new test, or changing source code will trigger a new test run.  
`make test` is the same as `grunt test` to make deployment tooling easier.  
`grunt test-travis` is similar to `grunt test` but will also try to send the coverage report to Coveralls - not for local use, since that'll fail.  

# Looking at coverage

As mentioned above, test coverage is automatically generated at test completion. You can see this from a local web server using the following command in the root of this repo:  

    python -m SimpleHTTPServer 8000

and pointing your web browser to  

    http://localhost:8000/build/test-coverage/html/

These pages will help you find any missing holes and cases you might not have captured.

# Happy testing!


<style type="text/css">
    body {
        font-family: sans-serif;
    }
    h1, h2, h3, h4, h5, h6 {
        xcolor: #FFF;
        color: blue;
    }
    h3 {
        padding: 4px;
        background-color: gray;
        color: #FFF;
    }
     code {
        xmargin: 1em;
        xdisplay: block;
        xpadding: 1em;
        xcolor: lime;
        background-color: #CCC;
    }
    pre > code {
        margin: 1em;
        display: block;
        padding: 1em;
        color: lime;
        background-color: black;
    }
</style>