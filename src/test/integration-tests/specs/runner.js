/*global describe, it, browser, expect, exports */
/*eslint-env node */
/*eslint strict: ["error", "global"] */
'use strict';
var utils = require('./utils');

// a suite is a set of tests
class Suite {
    constructor({ testFiles, testData, commonSpecs }) {
        this.testData = testData;
        this.commonSpecs = commonSpecs;
        this.tests = testFiles.map((testFile) => {
            return new Test({
                testDef: testFile,
                suite: this
            });
        });
    }

    run() {
        this.tests.forEach((test) => {
            test.run();
        });
    }
}

// a test is a set of test specs dedicated to one primary purpose,
// with variants.
class Test {
    constructor({ testDef, suite }) {
        this.suite = suite;
        this.testDef = testDef;
        this.specs = testDef.specs.map((specDef) => {
            return new Spec({
                specDef,
                test: this
            });
        });
    }

    run() {
        describe(this.testDef.description, () => {
            if (this.testDef.disabled) {
                return;
            }
            if (this.testDef.disable) {
                if (this.testDef.disable.envs) {
                    if (this.testDef.disable.envs.includes(this.suite.testData.env)) {
                        utils.info('skipping test because it is disabled for env: ' + this.suite.testData.env);
                        return;
                    }
                }
            }
            // const defaultUrl = this.testDef.defaultUrl || '/';
            this.specs.forEach((spec) => {
                spec.run(it);
            });
        });
    }
}

class Spec {
    constructor({ specDef, test }) {
        this.specDef = specDef;
        this.test = test;
        this.tasks = new TaskList({ taskDefs: specDef.tasks, spec: this });
    }

    run(it) {
        if (this.specDef.disabled) {
            return;
        }
        it(this.specDef.description, () => {
            if (this.specDef.disabled) {
                utils.info('skipping spec', this.specDef.description);
                return;
            }
            if (this.specDef.disable) {
                if (this.specDef.disable.envs) {
                    if (this.specDef.disable.envs.includes(this.test.suite.testData.env)) {
                        utils.info(
                            'skipping test spec because it is disabled for env: ' + this.test.suite.testData.env
                        );
                        return;
                    }
                }
            }
            var url = this.test.suite.testData.url;
            browser.url(url);
            this.tasks.run();
            // porque?
            browser.deleteCookie('kbase_session');
        });
    }
}

class TaskList {
    constructor({ taskDefs, spec }) {
        this.spec = spec;

        this.tasks = taskDefs.map((taskDef) => {
            if (taskDef.subtask) {
                return new TaskList({
                    taskDefs: this.spec.test.suite.commonSpecs[taskDef.subtask],
                    spec
                });
            } else {
                return new Task({ taskDef, spec });
            }
        });
    }

    run(it) {
        this.tasks.forEach((task) => {
            task.run(it);
        });
    }
}

class Task {
    constructor({ taskDef, spec }) {
        this.taskDef = taskDef;
        this.spec = spec;
        this.testData = this.spec.test.suite.testData;
    }

    run() {
        if (this.taskDef.disabled) {
            utils.info('-- skipping task', this.taskDef.title);
            return;
        }
        if (this.taskDef.disable) {
            if (this.taskDef.disable.envs) {
                if (this.taskDef.disable.envs.includes(this.testData.env)) {
                    utils.info('skipping task because it is disabled for env: ' + this.testData.env);
                    return;
                }
            }
        }
        try {
            this.doTask();
        } catch (ex) {
            console.error('Error running task: ' + ex.message, this.taskDef);
            throw ex;
        }
    }

    actionFunc() {
        if (this.taskDef.action) {
            switch (this.taskDef.action) {
            case 'setSessionCookie':
                return () => {
                    browser.setCookies([
                        {
                            name: 'kbase_session',
                            value: this.testData.token,
                            path: '/'
                        }
                    ]);
                    let cookie;
                    browser.call(() => {
                        return browser.getCookies(['kbase_session']).then((cookies) => {
                            cookie = cookies[0];
                        });
                    });
                    expect(cookie.value).toEqual(this.testData.token);
                };
            case 'deleteSessionCookie':
                return () => {
                    browser.deleteCookie('kbase_session');
                    let cookie;
                    browser.call(() => {
                        return browser.getCookies(['kbase_session']).then((cookies) => {
                            cookie = cookies[0];
                        });
                    });
                    expect(cookie).toBeUndefined();
                };
            case 'navigate':
                return () => {
                    browser.url('#' + this.interpValue(this.taskDef.path));
                };
            case 'keys':
                return () => {
                    browser.keys(this.taskDef.params.keys);
                };
            case 'switchToFrame':
                return () => {
                    browser.switchToFrame(0);
                };
            case 'switchToParent':
                return () => {
                    browser.switchToParentFrame();
                };
            case 'baseSelector':
                return () => {
                    this.spec.baseSelector = this.taskDef.selector;
                };
            case 'click':
                return () => {
                    browser.$(this.spec.resolvedSelector).click();
                };
            case 'setValue':
                return () => {
                    browser.setValue(this.spec.resolvedSelector, this.taskDef.params.value);
                };
            default:
                throw new Error('Unknown task action: "' + this.taskDef.action + '"');
            }
        } else {
            throw new Error('Missing action in task "' + this.taskDef.title || 'no title' + '"');
        }
    }

    waitFunc() {
        switch (this.taskDef.wait) {
        case 'forText':
            return () => {
                if (!browser.$(this.taskDef.resolvedSelector).isExisting()) {
                    return false;
                }
                const nodeValue = browser.$(this.taskDef.resolvedSelector).getText();
                const testValue = this.interpValue(this.taskDef.text);
                return nodeValue === testValue;
            };
        case 'forNumber':
            return () => {
                if (!browser.$(this.taskDef.resolvedSelector).isExisting()) {
                    return false;
                }
                var text = browser.$(this.taskDef.resolvedSelector).getText();
                if (!text) {
                    return false;
                }
                const value = Number(text.replace(/,/g, ''));
                return utils.isValidNumber(value, this.taskDef.number);
            };
        case 'forElementCount':
            return () => {
                try {
                    if (!browser.$(this.taskDef.resolvedSelector).isExisting()) {
                        return false;
                    }
                    const els = browser.$$(this.taskDef.resolvedSelector);
                    const count = els.length;
                    return utils.isValidNumber(count, this.taskDef.count);
                } catch (ex) {
                    return false;
                }
            };
        case 'forElement':
        default:
            return () => {
                return browser.$(this.taskDef.resolvedSelector).isExisting();
            };
        }
    }

    doTask() {
        // Primary tasks types are
        // switching to a window
        // setting a base selector
        // waiting for appearance, text, or number
        //

        if (this.taskDef.selector) {
            // selector based actions
            this.taskDef.resolvedSelector = this.makeSelector(this.taskDef.selector);
            this.spec.resolvedSelector = this.taskDef.resolvedSelector;
        }

        if (this.taskDef.wait) {
            const waitFunction = this.waitFunc();
            browser.waitUntil(waitFunction, this.taskDef.timeout || 5000);
        } else if (this.taskDef.action) {
            const actionFunction = this.actionFunc();
            actionFunction();
        }
    }

    interpValue(value) {
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
                    result += utils.getProp(this.testData, m[2], '');
                }
            } else if (m.length == 2) {
                result += m[1];
            }
        }
        return result;
    }

    buildAttribute(element) {
        if (element instanceof Array) {
            return element
                .map((element) => {
                    return this.buildAttribute(element);
                })
                .join('');
        }
        let nth = '';
        if (element.nth) {
            nth = ':nth-child(' + this.interpValue(element.nth) + ')';
        }
        if (element.type !== 'raw') {
            return '[data-k-b-testhook-' + element.type + '="' + this.interpValue(element.value) + '"]' + nth;
        } else {
            return '[' + element.name + '="' + this.interpValue(element.value) + '"]' + nth;
        }
    }
    buildSelector(path) {
        return path
            .map((element) => {
                return this.buildAttribute(element);
            })
            .join(' ');
    }
    makeSelector(selector) {
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
            fullPath = utils.extend(this.spec.baseSelector || [], selector.path);
            break;
        case 'absolute':
            fullPath = selector.path;
            break;
        }
        const sel = this.buildSelector(fullPath);
        return sel;
    }
}

exports.Suite = Suite;
