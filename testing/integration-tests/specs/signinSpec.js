/* global describe, it, browser, expect */

/* see http://webdriver.io/api */

'use strict';

var runner = require('../runner');

console.log('hmm, where am i?', process.cwd());

var tests = runner.load('./integration-tests/specs/plugins/auth2-client.json');

runner.runTests(tests);
