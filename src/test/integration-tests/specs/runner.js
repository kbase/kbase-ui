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
        return element
            .map(function (element) {
                return buildAttribute(element);
            })
            .join('');
    } else {
        if (element.type !== 'raw') {
            return '[data-k-b-testhook-' + element.type + '="' + element.value + '"]';
        } else {
            return '[' + element.name + '="' + element.value + '"]';
        }
    }
}
function buildSelector(path) {
    return path
        .map(function (element) {
            return buildAttribute(element);
        })
        .join(' ');
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
    } else if (typeof selector === 'object' && !selector.type) {
        selector.type = 'relative';
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
function getProp(obj, propPath, defaultValue) {
    if (typeof propPath === 'string') {
        propPath = propPath.split('.');
    } else if (!(propPath instanceof Array)) {
        throw new TypeError('Invalid type for key: ' + typeof propPath);
    }
    for (let i = 0; i < propPath.length; i += 1) {
        if (obj === undefined || typeof obj !== 'object' || obj === null) {
            return defaultValue;
        }
        obj = obj[propPath[i]];
    }
    if (obj === undefined) {
        return defaultValue;
    }
    return obj;
}
function interpValue(value, testData) {
    if (!value) {
        return value;
    }
    if (typeof value !== 'string') {
        return value;
    }

    // TODO: SUB SUBSTRING
    const subRe = /(.*?(?=\${.*}|$))(?:\${(.*?)})?/g;
    let result = '';
    let m;
    while ((m = subRe.exec(value))) {
        if (m.length === 3) {
            if (!m[0]) {
                break;
            }
            result += m[1];
            if (m[2]) {
                result += getProp(testData, m[2], '');
            }
        } else if (m.length == 2) {
            result += m[1];
        }
    }
    return result;
}
function isValidNumber(theNumber, comparisonSpec) {
    for (const [comparisonName, comparisonValue] of Array.from(Object.entries(comparisonSpec))) {
        switch (comparisonName) {
        case 'greaterThan':
            return theNumber > comparisonValue;
        case 'greaterThanOrEqual':
            return theNumber >= comparisonValue;
        case 'lessThan':
            return theNumber < comparisonValue;
        case 'lessThanOrEqual':
            return theNumber <= comparisonValue;
        case 'equal':
            return theNumber === comparisonValue;
        default:
            throw new Error('Invalid numeric comparison: ' + comparisonName);
        }
    }
}
function doTask(spec, task, testData) {
    if (task.switchToFrame) {
        const selector = buildSelector(task.switchToFrame.selector);
        browser.$(selector).waitForExist(task.switchToFrame.wait | 5000);
        // TODO: switching to frame by id should be possible, but
        // I'm getting an error.
        // const el = browser.$(selector);
        // const id = el.getAttribute('id');
        // const frame = browser.$(id).value;
        // Since the only frame in kbase-ui should be the plugin, this is
        // be a safe assumption, for now.
        browser.switchToFrame(0);
        return;
    } else if (task.switchToParent) {
        browser.switchToParentFrame();
    } else if (task.baseSelector) {
        // a hack for now...
        spec.baseSelector = task.baseSelector;
    } else if (task.selector) {
        var selector = makeSelector(spec.baseSelector, task.selector);
        var result = true;
        if (task.wait) {
            result = browser.$(selector).waitForExist(task.wait);
        }

        if (task.waitForText) {
            result = browser.waitUntil(function () {
                try {
                    var text = browser.$(selector).getText();
                    return text === interpValue(task.text, testData);
                } catch (ex) {
                    return false;
                }
            }, task.waitForText);
        } else if (task.waitUntilText) {
            result = browser.waitUntil(function () {
                try {
                    var text = browser.$(selector).getText();

                    return text === interpValue(task.waitUntilText.value, testData);
                } catch (ex) {
                    return false;
                }
            }, task.waitUntilText.wait);
        } else if (task.waitUntilNumber) {
            result = browser.waitUntil(function () {
                try {
                    var text = browser.$(selector).getText();
                    if (!text) {
                        return false;
                    }

                    const value = Number(text.replace(/,/g, ''));
                    return isValidNumber(value, task.waitUntilNumber.value);
                } catch (ex) {
                    return false;
                }
            }, task.waitUntilNumber.wait);
        } else if (task.waitUntilCount) {
            result = browser.waitUntil(function () {
                try {
                    const els = browser.$$(selector);
                    const count = els.length;
                    return isValidNumber(count, task.waitUntilCount.value);
                } catch (ex) {
                    return false;
                }
            }, task.waitUntilCount.wait);
        } else if (task.exists) {
            result = browser.$(selector).isExisting();
            expect(result).toBe(true);
        }

        if (!result) {
            return;
        }

        // only proceed with a further action if succeeded so far.
        if (task.text) {
            const text = browser.$(selector).getText();
            expect(text).toEqual(interpValue(task.text, testData));
        } else if (task.match) {
            const toMatch = browser.$(selector).getText();
            expect(toMatch).toMatch(new RegExp(task.text));
        } else if (task.number) {
            const toCompare = browser.$(selector).getText();
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
            const toCompare = browser.$$(selector).value.length;
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
                browser.$(selector).click();
                break;
            case 'set-session-cookie':
                {
                    browser.setCookies([
                        {
                            name: 'kbase_session',
                            value: testData.token,
                            path: '/'
                        }
                    ]);
                    let cookie;
                    browser.call(() => {
                        return browser.getCookies(['kbase_session']).then((cookies) => {
                            cookie = cookies[0];
                        });
                    });
                    expect(cookie.value).toEqual(testData.token);
                }
                break;
            case 'delete-cookie':
                {
                    browser.deleteCookie('kbase_session');
                    let cookie;
                    browser.call(() => {
                        return browser.getCookies(['kbase_session']).then((cookies) => {
                            cookie = cookies[0];
                        });
                    });
                    expect(cookie).toBeUndefined();
                }
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
        browser.url('#' + interpValue(task.navigate.path, testData));
    }
}

function doTasks(spec, tasks, testData, common) {
    if (spec.switchToFrame) {
        const selector = buildSelector(spec.switchToFrame.selector);
        browser.$(selector).waitForExist(spec.switchToFrame.wait | 5000);
        const frame = browser.$(selector).value;
        browser.switchToFrame(frame);
    }
    tasks.forEach(function (task) {
        if (task.disabled) {
            info('-- skipping task', task.title);
            return;
        }
        if (task.disable) {
            if (task.disable.envs) {
                if (task.disable.envs.includes(testData.env)) {
                    info('skipping task because it is disabled for env: ' + testData.env);
                    return;
                }
            }
        }
        if (task.subtask) {
            doTasks(spec, common[task.subtask], testData, common);
            return;
        }
        doTask(spec, task, testData);
    });
}

function runTest(test, common, testData) {
    describe(test.description, function () {
        if (test.disabled) {
            return;
        }
        if (test.disable) {
            if (test.disable.envs) {
                if (test.disable.envs.includes(testData.env)) {
                    info('skipping test because it is disabled for env: ' + testData.env);
                    return;
                }
            }
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
                if (spec.disable) {
                    if (spec.disable.envs) {
                        if (spec.disable.envs.includes(testData.env)) {
                            info('skipping test spec because it is disabled for env: ' + testData.env);
                            return;
                        }
                    }
                }
                var url = spec.url || defaultUrl;
                browser.url(url);
                doTasks(spec, spec.tasks, testData, common);
                browser.deleteCookie('kbase_session');
            });
        });
    });
}

function runTests(tests, common) {
    const testData = loadJSONFile(__dirname + '/../config.json');
    tests.forEach(function (test) {
        runTest(test, common, testData);
    });
}

exports.runTests = runTests;
exports.loadJSONFile = loadJSONFile;
exports.loadYAMLFile = loadYAMLFile;
