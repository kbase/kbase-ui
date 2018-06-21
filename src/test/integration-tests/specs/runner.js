/*global describe, it, browser, expect, exports */
/*eslint-env node */
/*eslint strict: ["error", "global"] */
'use strict';
var fs = require('fs');
var yaml = require('js-yaml');

function loadJSONFile(file) {
    var contents = fs.readFileSync(file, 'utf8');
    return JSON.parse(contents);
}

function loadYAMLFile(file) {
    var contents = fs.readFileSync(file, 'utf8');
    return yaml.safeLoad(contents);
}

function buildAttribute(element) {
    if (element instanceof Array) {
        return element.map(function (element) {
            return buildAttribute(element);
        }).join('');
    } else {
        return '[data-k-b-testhook-' + element.type + '="' + element.value + '"]';
    }
}
function buildSelector(path) {
    return path.map(function (element) {
        return buildAttribute(element);
    }).join(' ');
}
function extend(path, elements) {
    var newPath = path.map(function (el) {
        return el;
    });
    elements.forEach(function (element) {
        newPath.push(element);
    });
    return newPath;
}
function makeSelector(base, selector) {
    if (selector instanceof Array) {
        selector = {
            type: 'relative',
            path: selector
        };
    }
    var fullPath;
    switch (selector.type) {
    case 'relative':
        fullPath = extend(base, selector.path);
        break;
    case 'absolute':
        fullPath = selector.path;
        break;
    }
    return buildSelector(fullPath);

}
function info() {
    const args = Array.prototype.slice.call(arguments);
    process.stdout.write(args.join(' ') + '\n');
}
function interpValue(value, testData) {
    if (!value) {
        return value;
    }
    if (typeof value !== 'string') {
        return value;
    }
    return value.replace(/^[$](.*)$/, (m, key) => {
        return testData[key];
    });
}
function doTask(spec, task, testData) {
    if (task.selector) {
        var selector = makeSelector(spec.baseSelector, task.selector);
        var result = true;
        if (task.wait) {
            result = browser.waitForExist(selector, task.wait);
        } if (task.waitForText) {
            result = browser.waitForText(selector, interpValue(task.waitForText, testData));
        } else if (task.waitUntilText) {
            result = browser.waitUntil(function () {
                try {
                    var text = browser.getText(selector);
                    return (text === interpValue(task.waitUntilText.value, testData));
                } catch (ex) {
                    return false;
                }
            }, task.waitUntilText.wait);
        } else if (task.exists) {
            result = browser.isExisting(selector);
            expect(result).toBe(true);
        }

        if (!result) {
            return;
        }

        // only proceed with a further action if succeeded so far.
        if (task.text) {
            const text = browser.getText(selector);
            expect(text).toEqual(interpValue(task.text, testData));
        } else if (task.match) {
            const toMatch = browser.getText(selector);
            expect(toMatch).toMatch(new RegExp(task.text));
        } else if (task.number) {
            const toCompare = browser.getText(selector);
            expect(toCompare).toBeDefined();
            const theNumber = Number(toCompare.replace(/,/g, ''));

            Object.keys(task.number).forEach(function (comparison) {
                var comparisonValue = task.number[comparison];
                switch (comparison) {
                case 'greaterThan':
                    expect(theNumber).toBeGreaterThan(comparisonValue);
                    break;
                case 'greaterThanOrEqual':
                    expect(theNumber).toBeGreaterThanOrEqual(comparisonValue);
                    break;
                case 'lessThan':
                    expect(theNumber).toBeLessThan(comparisonValue);
                    break;
                case 'lessThanOrEqual':
                    expect(theNumber).toBeLessThanOrEqual(comparisonValue);
                    break;
                case 'equal':
                    expect(theNumber).toEqual(comparisonValue);
                    break;
                }
            });
        } else if (task.count) {
            // count the elements which matched this selector
            const toCompare = browser.elements(selector).value.length;
            expect(toCompare).toBeDefined();

            Object.keys(task.count).forEach(function (comparison) {
                var comparisonValue = task.count[comparison];
                switch (comparison) {
                case 'greaterThan':
                    expect(toCompare).toBeGreaterThan(comparisonValue);
                    break;
                case 'greaterThanOrEqual':
                    expect(toCompare).toBeGreaterThanOrEqual(comparisonValue);
                    break;
                case 'lessThan':
                    expect(toCompare).toBeLessThan(comparisonValue);
                    break;
                case 'lessThanOrEqual':
                    expect(toCompare).toBeLessThanOrEqual(comparisonValue);
                    break;
                case 'equal':
                    expect(toCompare).toEqual(comparisonValue);
                    break;
                }
            });
        }

        // Actions
        if (task.action) {
            switch (task.action) {
            case 'click':
                browser.click(selector);
                break;
            case 'set-session-cookie':
                browser.setCookie({
                    name: 'kbase_session',
                    value: testData.token,
                    path: '/'
                });
                var cookie = browser.getCookie('kbase_session');
                expect(cookie.value).toEqual(testData.token);
                break;
            case 'delete-cookie':
                browser.deleteCookie();
                expect(browser.getCookie('kbase_session')).toBeNull();
                break;
            case 'navigate':
                browser.url(task.params.url);
                break;
            case 'set-value':
                browser.setValue(selector, task.params.value);
                break;
            case 'keys':
                browser.keys(task.params.keys);
                break;
            default:
                throw new Error('Unknown task action ' + task.action);
            }
        }
    } else if (task.navigate) {
        browser.url('#' + task.navigate.path);
    }
}

function doTasks(spec, tasks, testData, common) {
    tasks.forEach(function (task) {
        if (task.disabled) {
            info('-- skipping task', task.title);
            return;
        }
        if (task.subtask) {
            doTasks(spec, common[task.subtask], testData, common);
            return;
        }
        doTask(spec, task, testData);
    });
}

function runTest(test, common) {
    var testData = loadJSONFile(__dirname + '/../config.json');
    describe(test.description, function () {
        if (test.disabled) {
            return;
        }
        var defaultUrl = test.defaultUrl || '/';
        test.specs.forEach(function (spec) {
            if (spec.disabled) {
                return;
            }
            it(spec.description, function () {
                if (spec.disabled) {
                    info('skipping spec', spec.description);
                    return;
                }
                var url = spec.url || defaultUrl;
                browser.url(url);
                doTasks(spec, spec.tasks, testData, common);
                browser.deleteCookie();
            });
        });
    });
}

function runTests(tests, common) {
    tests.forEach(function (test) {
        runTest(test, common);
    });
}

exports.runTests = runTests;
exports.loadJSONFile = loadJSONFile;
exports.loadYAMLFile = loadYAMLFile;