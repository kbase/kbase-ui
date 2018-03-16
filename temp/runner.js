/*global describe, it, browser, expect, exports */
/*eslint-env node */
/*eslint strict: ["error", "global"] */
'use strict';
var fs = require('fs');
var path = require('path');

function load(file) {
    var contents = fs.readFileSync(__dirname + '/' + file);
    var testScript = JSON.parse(contents);
    var pluginId = path.dirname(file);
    return {
        plugin: pluginId,
        file: file,
        scripts: testScript
    };
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
    let args = Array.prototype.slice.call(arguments);
    process.stdout.write(args.join(' ') + '\n');
}
function doTask(spec, task, testData) {
    if (task.selector) {
        var selector = makeSelector(spec.baseSelector, task.selector);
        var result = true;
        if (task.wait) {
            result = browser.waitForExist(selector, task.wait);
        } if (task.waitForText) {
            result = browser.waitForText(selector, task.waitForText);
        } else if (task.waitUntilText) {
            result = browser.waitUntil(function () {
                try {
                    var text = browser.getText(selector);
                    return (text === task.waitUntilText.value);
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
            let text = browser.getText(selector);
            expect(text).toEqual(task.text);
        } else if (task.match) {
            let toMatch = browser.getText(selector);
            expect(toMatch).toMatch(new RegExp(task.text));
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
        console.warn('navigating to', task.navigate.path);
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

function runTest(script, test, common) {
    var testData = load('../config.json');
    var description = 'test => plugin: [' + script.plugin + '], description: ' + test.description;
    info(description);
    describe(description, function () {
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

function runTests(testScript, common) {
    testScript.scripts.forEach(function (test) {
        info('\nRunning ' + testScript.scripts.length + ' tests scripts for plugin: ' + testScript.plugin);
        runTest(testScript, test, common);
    });
}

exports.runTests = runTests;
exports.load = load;