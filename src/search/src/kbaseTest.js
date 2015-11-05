/*jslint browser: true,  todo: true, vars: true, nomen: true */
/*global define */
/**
 * A primitive testing framework for javascript objects.
 * 
 * @module Test
 * 
 * @todo document
 * @todo test the test!
 */


/**
 * 
 * @typedef {TestConfig} 
 * @property {string} expected - The expected result status for the test
 * @property {HTMLElement} container - The DOM node to which the results will 
 * be shown.
 * @property {object} object - the object on which the methods is to be tested.
 * @property {string} method - The name of the method to be tested.
 * @
 * 
 */

define(['underscore', 'q'], function (_, Q) {
    'use strict';
    return Object.create({}, {
        /**
         * Initialize the object to a sane state. Serves like a constructor
         * for classic prototype-based composition.
         * 
         * @function init
         * 
         * @param {object} cfg - a configuration object
         * 
         * @returns {object} a reference to the object itself, for chaining.
         */
        init: {
            value: function (cfg) {
                /*var k;
                for (k in cfg) {
                    this[k] = cfg[k];
                }
                if (cfg.type === undefined) {
                    cfg.type = 'method';
                }
                */
                
                this.id = cfg.id;
                this.type = cfg.type || 'method';
                this.name = cfg.name;
                this.description = cfg.description;
                this.expected = cfg.expected;
                this.whenResult = cfg.whenResult;
                

                // this isn't, or should be, used any more.
                this.getResult = cfg.getResult;

                this.testResult = cfg.testResult;
                
                this.container = document.querySelector('[data-test="' + this.id + '"]');
                this.setupDisplay();

                this.tests = cfg.tests;

                // @todo this should be wrapped in an object that is passed to the test method associated with type
                
                this.propertyName = cfg.propertyName;
                this.makeObject = cfg.makeObject;
                this.object = cfg.object;
                this.method = cfg.method;
                

                return this;
            }
        },
        
        /**
         * Displays the results of an individual test in the container node.
         * It is typically used to display failed tests, but may be used to
         * display any test result.
         * 
         * @function showResult
         * 
         * @param {object} context - a plain object containing properties to be
         * displyed.
         * 
         * @returns {undefined}
         * 
         */
        showResult: {
            value: function (context) {
                var n = document.createElement('div'), color;
                if (context.status === 'ok') {
                    color = 'green';
                } else {
                    color = 'red';
                }
                n.innerHTML = '<div style="border: 1px ' + color + ' solid; marginput: 10px 0 0 0;">' +
                              '<div>Type: <span data-field="type">' + context.type + '</span></div>' +
                              '<div>Test: <span data-field="id">' + context.id + '</span></div>' +
                              '<div>Description: <span data-field="id">' + context.description + '</span></div>' +
                              '<div>Subtest: <span data-field="subtest">' + context.subtest + '</span></div>' +
                              '<div>Input: <span data-field="status">' + context.input + '</span></div>' +
                              '<div>Status: <span data-field="status">' + context.status + '</span></div>' +
                              '<div>Elapsed: <span data-field="status">' + context.elapsed + '</span></div>' +
                              '<div>Expecting: <span data-field="expected">' + context.expected + '</span></div>' +
                              '<div>Actual: <span data-field="result">' + context.actual + '</span></div>' +
                              '<div>Message <span data-field="result">' + context.message + '</span></div></div>';
                this.container.appendChild(n);
            }
        },
       
        setupDisplay: {
            value: function () {
                this.header = document.createElement('div');
                this.body = document.createElement('div');
                this.footer = document.createElement('div');
                this.layout = document.createElement('div');
                this.layout.appendChild(this.header);
                this.layout.appendChild(this.body);
                this.layout.appendChild(this.footer);
                this.container.appendChild(this.layout);
            }
        },
        showHeader: {
            value: function () {
                var c = '';
                c += '<span class="title" style="font-weight: bold; font-size: 150%;">' + (this.name || '** no name **') + '</span>';
                c += '<p style="font-style: italic;">' + this.description + '</p>';
                this.header.innerHTML = c;
            }
        },
        showTestLine: {
            value: function (test) {
                var line = document.createElement('div');
                line.setAttribute('data-test-id', test.id+'');

                var title = document.createElement('div');
                var c = '';
                c += '<span class="test-id" style="font-weight: bold;">Test ' + test.id + ': </span>';
                c += '<span>' + test.description || '** no desc **' + '</span>';
                c += '<span data-item="result" style="margin-left: 2em;"></span>';
                title.innerHTML = c;
                line.appendChild(title);
                this.body.appendChild(line);
            }
        },
        showTestResult: {
            value: function (test, result) {
                var resultNode = this.body.querySelector('[data-test-id="' + test.id + '"] [data-item="result"]');
                if (resultNode) {
                    resultNode.innerHTML = result;
                }
                if (result === 'PASS') {
                    resultNode.style.color = 'green';
                } else {
                    resultNode.style.color = 'red';
                }
            }
        },
        /**
         * Displays the summary statistics for the test run, appended to the 
         * container node.
         * 
         * @function showFinal
         * 
         * @param {object} context - a simple object containing properties to display.
         * 
         * @returns {undefined}
         */
        showSummary: {
            value: function (context) {
                var n = document.createElement('div');
                n.innerHTML = '<div>Successes: ' + context.succeed + '</div>' +
                              '<div>Fails: ' + context.fail + '</div>' +
                              '<div>Errors: ' + context.error + '</div>';
                this.container.appendChild(n);
            }
        },
        /**
         * @typedef {object} MethodTestResult
         * @property {object} output - the result of the output comparison, if any
         * @property {object} mutation - the result of the mutation comparison, if any
         * @property {object} exception - the result of the exception comparison, if any
         * @property {object} error - 
         */

        /**
         * Runs a method test on the output.
         * 
         * @todo convert to setting a success flag, or perhaps we have it right...
         */
        runMethodOutputTest: {
            value: function (test, output) {
                var result = {
                    type: 'output',
                    actual: output
                };
                if (typeof test.expects.output === 'function') {
                    // NB the output function call is invoked with the test 
                    // as the context, so it has access to the object itself,
                    // useful for "this" tests.
                    result.expected = test.expects.output.call(this, test);
                    if (_.isEqual(output, result.expected)) {
                        result.status = 'success';
                        result.message = 'output matches expected';
                    } else {
                        result.status = 'failure';
                        result.message = 'output does not match expected';
                    }                
                } else if (typeof test.expects.output === 'object') {
                    result.message = test.expects.output.name;
                    if (test.expects.output.test.call({}, output)) {
                        result.status = 'success';
                    } else {
                        result.status = 'failure';
                    }                    
                } else {
                    // simple equality test.
                    result.expected = test.expects.output;
                    if (_.isEqual(output, result.expected)) {
                        result.status = 'success';
                        result.message = 'output matches expected';
                    } else {
                        result.status = 'failure';
                        result.message = 'output does not match expected';
                    }
                }
                
                return result;
            }
        },
        runMethodMutationTest: {
            value: function (test) {
                
                var result = {
                    type: 'mutation',
                    expected: test.expects.mutation,
                    // NB freeze the input to protect from further change.
                    actual: test.input
                };
                
                var i;
                var mutated = [];
                var mismatches = [];
                // First see if we have any mutations of input.
                for (i = 0; i < test.input; i += 1) {
                    if (!_.isEqual(test.input[i], test.originalInput[i])) {
                        mutated.push(i);
                    }
                }
                // And if we have any expectation mismatches.
                if (test.expects.mutation) {
                    for (i = 0; i < test.input; i += 1) {
                        if (!_.isEqual(test.input[i], test.expects.mutation[i])) {
                            mismatches.push(i);
                        }
                    }
                }
                // Now the test
                if (mutated.length > 0) {
                    if (test.expects.mutation) {
                        if (mismatches.length === 0) {
                            result.status = 'success';
                            result.message = 'Muatations were found, and matched the expected mutations';
                        } else {
                            result.status = 'failure';
                            result.message = 'Mutations were found, but the expectation did not match';
                        }
                    } else {
                        result.status = 'failure';
                        result.message = 'Mutations were made to the input, but were not expected';
                    }
                } else {
                    if (test.expects.mutation) {
                        if (mismatches.length === 0) {
                            result.status = 'success';
                            result.message = 'No mutations, and the expectation was for no change';
                        } else {
                            result.status = 'failure';
                            result.message = 'No mutations found, but were expected';
                        }
                    } else {
                        result.status = 'success';
                        result.message = 'No mutations found, none expected'
                    }
                }
                return result;
            }
        },
        exceptionMatch: {
            value: function (ex, test) {
                if (typeof ex === 'string') {
                    if  (ex === test) {
                        return true;
                    }
                }
                var type = eval(test.type);
                if (ex instanceof type) {
                    if (ex.message === test.message) {
                        return true;
                    }
                }
                return false;
            }
        },
        runMethodExceptionTest: {
            value: function (test, ex) {
                var result = {
                    type: 'exception',
                    expected: test.expects.exception,
                    actual: ex
                };
                if (ex !== undefined) {
                    if (test.expects.exception) {
                        if (this.exceptionMatch(ex, test.expects.exception)) {
                            result.status = 'success';
                            result.message = 'exception encountered, and it matches the expectation';
                        } else {
                            result.status = 'failure';
                            result.message = 'exception encountered, and it fails the expectation';
                        }
                    } else {
                        result.status = 'failure';
                        console.log('EX');
                        console.log(ex);
                        result.message = 'test not supplied, but exception encountered';
                    }
                } else {
                    if (test.expects.exception) {
                        result.status = 'failure';
                        result.message = 'test supplied, but no exception encountered';
                    } else {
                        result.status = 'success';
                        result.message = 'no exception encountered, and non expected';
                    }
                }
                return result;
            }
        },
        
        /**
         * Runs a single test for a method test run.
         * 
         * It compares the result of executing the method with the supplied
         * input arguments to an expected output value.
         * 
         * The method test can look at three different attributes, depending
         * on what the test is after.
         * An output comparison will inspect the output of executing the method
         * with the supplied inputs.
         * A mutation comparison will inspect the state of input arguments after
         * method execution, comparing to mutation values provided.
         * An exception comparison will inspect an exception generated by 
         * executing the method with the provided inputs, comparing it to the
         * provided exception expected value.
         * 
         * Each of these three states is inspected, and the results compared
         * to the supplied expected values.
         * 
         * @function runMethodTest
         * 
         * @param {object} test - a method test specification
         * 
         * @returns {MethodTestResult} the result of the test.
         *
         */
        runMethodTest: {
            value: function (test) {
                // var result = [];
                // TODO: this should be test.input, not test.expects.input
                // test.originalInput = JSON.parse(JSON.stringify(test.expects.input));
                //if (!this.testPromise) {
                //    this.testPromise = function (obj, input) {
                //        return Q.Promise(function (resolve) {
                //            resolve(obj[this.method].apply(obj, input));
                //        });
                //    };
                //}
                var whenResult = test.whenResult || this.whenResult;
                return Q.Promise(function (resolve) {
                    var start = new Date();
                    whenResult(test)
                        .then(function (output) {
                            var results = [];
                            results.push(this.runMethodOutputTest(test, output));
                            if (!test.ignoreMutation) {
                                // console.log('ignoring mutation test');
                                results.push(this.runMethodMutationTest(test));
                            }
                            test.result.results = results;
                            //console.log('in method test');
                            //console.log(test);
                            var elapsed = (new Date()).getTime() - start.getTime();
                            test.elapsed = elapsed;
                            resolve(test);
                        }.bind(this))
                        .catch(function (err) {
                            // console.log('in method test EX');
                            // console.log(err);
                            test.result.results = [this.runMethodExceptionTest(test, err)];
                            var elapsed = (new Date()).getTime() - start.getTime();
                            test.elapsed = elapsed;
                            resolve(test);
                        }.bind(this))
                        .done();
                }.bind(this));
            }
        },
        /**
         * Returns the object being tested. Used by test methods to avoid 
         * direct references to the test object.
         * 
         * @function getObject
         * 
         * @returns {object} an arbitrary object, the object being tested.
         */
        getObject: {
            value: function () {
                var obj;
                if (this.makeObject) {
                    obj = this.makeObject();
                } else {
                    obj = this.object;
                }
                return obj;
            }
        },
        /**
         * @typedef {object} PropertyTestResult
         * @property {object} comparison - the result of a comparing the given 
         * property to the provided expected property value.
         * @property {object} error - the result of an exception encountered during
         * the execution of the test. Note that this is NOT the same as an 
         * exception anaylsis
         */
        /**
         * Executes a test of the value of a property. This is a simple test,
         * only inspecting the property on an object
         * 
         * @function runPropertyTest
         * 
         * @todo provide a properties test that allows executing of arbitrary code
         * 
         * @params {object} test - a test specification
         * 
         * @returns {PropertyTestResult} the result of the test
         */
        runPropertyComparisonTest: {
            value: function (test, value) {
                var status;
                if (_.isEqual(test.expects.propertyValue, value)) {
                    status = 'success';
                } else {
                    status = 'failure';
                }
                return {
                    expected: test.expectedValue,
                    actual: value,
                    status: status
                };
            }
        },
        runPropertyTest: {
            value: function (test) {
                var actual = this.getObject()[this.propertyName];
                return [this.runPropertyComparisonTest(test, actual)];
            }
        },
        runTest: {
            value: function (test) {
                switch (this.type) {
                case 'property':
                    return this.runPropertyTest(test);
                case 'method':
                    var r = this.runMethodTest(test);
                    return r;
                default:
                    return this.runMethodTest(test);
                }
            }
        },
        runTests: {
            value: function () {
                var testId = 0,
                    summary = {
                        succeed: 0,
                        fail: 0,
                        error: 0,
                        unknown: 0
                    };
                    
                // Show the test header.
                this.showHeader(this.name);
                
                // Set up tests.
                this.tests.forEach(function (test) {
                    testId += 1;
                    test.id = testId;
                    test.result = {
                        id: testId,
                        start: (new Date()),
                        status: 'pending'
                    };
                    test.object = this.getObject();
                    // TODO: exception should be caught here.

                    test.whenTest= this.runTest(test);
                    
                    this.showTestLine(test);
                }.bind(this));
                
                // now run the tests, updating the display for each line.
                Q.allSettled(this.tests.map(function (test) {return test.whenTest;}))
                    .then(function (results) {
                        results.forEach(function (qResult) {
                            var test = qResult.value;
                            // this is a Q thing ... a bit funky if you ask me... eap
                            if (qResult.state === 'fulfilled') {
                                var subtestFail = false;
                                test.result.results.forEach(function (result) {
                                    var expectedStatus = test.expects.status || 'success';
                                    if (expectedStatus !== result.status) {
                                        subtestFail = true;
                                        this.showResult({
                                            id: this.id,
                                            type: this.type,
                                            tester: this.description,
                                            description: test.description,
                                            status: result.status,
                                            elapsed: test.elapsed,
                                            input: JSON.stringify(test.input),
                                            expected: JSON.stringify(result.expected),
                                            actual: JSON.stringify(result.actual),
                                            subtest: result.type,
                                            message: 'Expected test result of ' + expectedStatus + ', but got ' + result.status + '.' + result.message
                                        });
                                    } 
                                }.bind(this));
                                if (subtestFail) {
                                    test.status = 'fail';
                                    this.showTestResult(test, 'fail');
                                    // test.fail += 1;
                                } else {
                                    test.status = 'success';
                                    this.showTestResult(test, 'PASS');
                                    // succeed += 1;
                                }
                            } else {
                                test.status = 'error';
                                this.showResult({
                                    id: this.id,
                                    type: this.type,
                                    description: this.description,
                                    status: 'error',
                                    //input: JSON.stringify(test.expects.input),
                                    //expected: JSON.stringify(subtest.expected),
                                    //actual: JSON.stringify(subtest.actual),
                                    // subtest: subtest.type,
                                    message: 'Error thrown running the test: ' + err.message
                                });
                            }
                        }.bind(this));
                        results.forEach(function (result) {
                            if (result.value.status === 'success') {
                                summary.succeed += 1;
                            } else if (result.value.status === 'fail') {
                                summary.fail += 1;
                            } else if (result.value.status === 'error') {
                                summary.error += 1;
                            } else {
                                summary.unknown += 1;
                            }
                        });
                        this.showSummary(summary);
                    }.bind(this))
                    .catch(function (err) {
                       console.log('ERROR'); 
                       console.log(err);
                    })
                    .done();
            }
        }
    });
});

