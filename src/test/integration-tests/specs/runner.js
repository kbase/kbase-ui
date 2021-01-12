/*global describe, it, browser, expect */
/*eslint-env node */
/*eslint strict: ["error", "global"] */
'use strict';
var utils = require('./utils');
var handlebars = require('handlebars');

const DEFAULT_TASK_TIMEOUT = process.env.DEFAULT_TASK_TIMEOUT || 10000;
const DEFAULT_PAUSE_FOR = process.env.DEFAULT_PAUSE_FOR || 1000;


function getProp(obj, propPath, defaultValue) {
    if (typeof propPath === 'string') {
        propPath = propPath.split('.');
    } else if (!(propPath instanceof Array)) {
        throw new TypeError('Invalid type for key: ' + typeof propPath);
    }
    const propStack = [];
    for (let i = 0; i < propPath.length; i += 1) {
        if (obj === undefined || typeof obj !== 'object' || obj === null) {
            return defaultValue;
        }
        propStack.push(propPath[i]);
        obj = obj[propPath[i]];
    }
    if (obj === undefined) {
        return defaultValue;
    }
    return obj;
}

// a suite is a set of tests
class Suite {
    constructor({testFiles, context, subTasks}) {
        this.context = context;
        this.subTasks = subTasks;
        this.tests = testFiles.map((testDef) => {
            return new Test({
                testDef,
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

// a test is a set of test cases dedicated to one primary purpose.
class Test {
    constructor({testDef, suite}) {
        this.suite = suite;
        this.context = JSON.parse(JSON.stringify(suite.context));
        this.testDef = testDef;
        this.subtasks = testDef.subtasks || {};
        this.cases = testDef.cases.map((testCaseDef) => {
            return new TestCase({
                testCaseDef,
                test: this,
                context: this.context
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
                    if (this.testDef.disable.envs.includes(this.context.config.env)) {
                        utils.info('skipping test because it is disabled for env: ' + this.context.config.env);
                        return;
                    }
                }
            }
            // const defaultUrl = this.testDef.defaultUrl || '/';
            this.cases.forEach((testCase) => {
                testCase.run(it);
            });
        });
    }
}

class TestCase {
    constructor({testCaseDef, test, context}) {
        this.testCaseDef = testCaseDef;
        this.test = test;
        this.context = context;
        this.tasks = new TaskList({
            taskDefs: testCaseDef.tasks,
            testCase: this,
            context
        });
    }

    run(it) {
        if (this.testCaseDef.disabled) {
            return;
        }
        it(this.testCaseDef.description, () => {
            if (this.testCaseDef.disabled) {
                utils.info('skipping case', this.testCaseDef.description);
                return;
            }
            if (this.testCaseDef.disable) {
                if (this.testCaseDef.disable.envs) {
                    if (this.testCaseDef.disable.envs.includes(this.context.config.env)) {
                        utils.info(
                            'skipping test case because it is disabled for env: ' + this.context.config.env
                        );
                        return;
                    }
                }
            }
            if (this.testCaseDef.enable) {
                if (this.testCaseDef.enable.envs) {
                    if (!this.testCaseDef.enable.envs.includes(this.context.config.env)) {
                        utils.info(
                            'skipping test case because it is not enabled for env: ' +
                            this.context.config.env
                        );
                        return;
                    }
                }
            }

            const url = this.context.config.url;
            // must go to a hash path, not root, which redirects to the kbase home page.
            browser.url(url + '#about');
            this.tasks.run();
            // porque?
            browser.deleteCookie('kbase_session');
            browser.reloadSession();
        });
    }
}

class TaskList {
    constructor({taskDefs, testCase, context}) {
        this.testCase = testCase;
        try {
            this.context = Object.assign(JSON.parse(JSON.stringify(context)));
        } catch (ex) {
            console.error('Error parsing context', ex, context, testCase);
            throw new Error('Error parsing context: ' + ex.message);
        }

        this.tasks = taskDefs
            .map((taskDef) => {
                if (taskDef.subtask) {
                    // makes a copy of the context
                    const contextCopy = Object.assign(JSON.parse(JSON.stringify(this.context)));
                    contextCopy.local = taskDef.context || {};
                    if (typeof taskDef.subtask === 'string') {
                        const subTask = this.testCase.test.subtasks[taskDef.subtask] ||
                            this.testCase.test.suite.subTasks[taskDef.subtask];
                        if (!subTask) {
                            throw new Error('No subtask named: ' + taskDef.subtask);
                        }
                        return new TaskList({
                            taskDefs: subTask.tasks,
                            testCase,
                            context: contextCopy
                        });
                    } else {
                        if (this.isDisabled(taskDef.subtask)) {
                            return null;
                        }
                        return new TaskList({
                            taskDefs: taskDef.subtask.tasks,
                            testCase,
                            context: contextCopy
                        });
                    }
                } else {
                    return new Task({taskDef, testCase, context: this.context});
                }
            })
            .filter((taskDef) => {
                return taskDef;
            });
    }

    isDisabled(taskDef) {
        if (taskDef.disable) {
            if (taskDef.disable.envs) {
                if (taskDef.disable.envs.includes(this.context.config.env)) {
                    utils.info('skipping task because it is disabled for env: ' + this.context.config.env);
                    return true;
                }
            }
        }
        if (taskDef.enable) {
            if (taskDef.enable.envs) {
                if (taskDef.enable.envs.includes(this.context.config.env)) {
                    return false;
                } else {
                    utils.info('skipping task because it is not enabled for env: ' + this.context.config.env);
                    return true;
                }
            }
        }
        return false;
    }

    isEnabled(taskDef) {
        if (taskDef.enable) {
            if (taskDef.enable.envs) {
                if (taskDef.enable.envs.includes(this.context.config.env)) {
                    return true;
                } else {
                    utils.info('skipping task because it is not enabled for env: ' + this.context.config.env);
                    return false;
                }
            }
        } else {
            return null;
        }
    }

    run(it) {
        this.tasks.forEach((task) => {
            task.run(it);
        });
    }
}

class Task {
    constructor({taskDef, testCase, context}) {
        this.taskDef = taskDef;
        this.testCase = testCase;
        this.context = context;
    }

    run() {
        const taskDef = this.taskDef;
        if (taskDef.disabled) {
            utils.info('-- skipping task', taskDef.title);
            return;
        }
        if (taskDef.disable) {
            if (taskDef.disable.envs) {
                if (taskDef.disable.envs.includes(this.context.config.env)) {
                    utils.info('skipping task because it is disabled for env: ' + this.context.config.env);
                    return;
                }
            }
        }
        if (taskDef.enable) {
            if (taskDef.enable.envs) {
                if (!taskDef.enable.envs.includes(this.context.config.env)) {
                    utils.info('skipping task because it is not enabled for env: ' + this.context.config.env);
                    return;
                }
            }
        }
        try {
            this.doTask(taskDef);
        } catch (ex) {
            console.error('Error running task: ' + ex.message, taskDef);
            throw ex;
        }
    }

    getParam(taskDef, paramName, defaultValue) {
        const params = taskDef.params || taskDef;
        let paramValue;
        if (typeof paramName === 'string') {
            paramValue = params[paramName];
        } else if (Array.isArray(paramName)) {
            paramValue = paramName.map((name) => {
                return params[name];
            })
                .filter((value) => {
                    return typeof value === 'undefined' ? false : true;
                });
            if (paramValue.length <= 1) {
                paramValue = paramValue[0];
            } else {
                throw new Error(`For action task ${taskDef.action}, too many params matching ${paramName.join(',')}`);
            }

        } else {
            throw new Error(`Action task ${taskDef.action} param needs to be a string or array`);
        }

        if (typeof paramValue === 'undefined') {
            if (typeof defaultValue !== 'undefined') {
                paramValue = defaultValue;
            } else {
                throw new Error(`Action task ${taskDef.action} does not have param named "${paramName}"`);
            }
        }

        if (typeof paramValue === 'string') {
            return this.interpValue(paramValue);
        }
        return paramValue;
    }

    loopFunc(taskDef) {
        const loopPropertyName = taskDef.as || 'loop';
        const contextArray = getProp(this.context, taskDef.loop);
        if (typeof contextArray === 'undefined') {
            console.error('Loop context is undefined!', JSON.stringify(contextArray), JSON.stringify(this.context));
            throw new Error('Loop context undefined: ' + taskDef.loop);
        }
        if (!Array.isArray(contextArray)) {

            throw new Error('Sorry, context is not an array!');
        }

        contextArray.forEach((loopValue) => {
            const context = {
                [loopPropertyName]: loopValue
            };
            return new TaskList({
                taskDefs: taskDef.tasks,
                testCase: this.testCase,
                context
            }).run();
        });

    }

    actionFunc(taskDef) {
        if (taskDef.action) {
            switch (taskDef.action) {
            case 'setSessionCookie':
                return () => {
                    const token = this.getParam(taskDef, 'token');
                    browser.setCookies([
                        {
                            name: 'kbase_session',
                            value: token,
                            path: '/'
                        }
                    ]);
                    let cookie;
                    browser.call(() => {
                        return browser.getCookies(['kbase_session']).then((cookies) => {
                            cookie = cookies[0];
                        });
                    });
                    expect(cookie.value).toEqual(token);
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
                    const path = this.getParam(taskDef, 'path');
                    const url = '#' + path;
                    browser.url(url);
                };
            case 'keys':
                return () => {
                    const keys = this.getParam(taskDef, 'keys', false);
                    if (keys) {
                        keys.forEach((key) => {
                            browser.keys(key);
                        });
                    } else {
                        const string = this.getParam(taskDef, 'string', false);
                        if (string) {
                            string.split('').forEach((key) => {
                                browser.keys(key);
                            });
                        } else {
                            throw new Error('"keys" action requires either a param of either "keys" or "string"');
                        }
                    }
                };
            case 'switchToFrame':
            case 'switchToPluginIFrame':
                return () => {
                    browser.switchToFrame(browser.$('[data-k-b-testhook-iframe="plugin-iframe"]'));
                };
            case 'switchToParent':
                return () => {
                    browser.switchToParentFrame();
                };
            case 'switchToTop':
                return () => {
                    browser.switchToFrame(null);
                };
            case 'baseSelector':
                return () => {
                    this.testCase.baseSelector = this.getParam(taskDef, 'selector');
                };
            case 'click':
                return () => {
                    browser.$(this.testCase.resolvedSelector).click();
                };
            case 'scrollIntoView':
            case 'scroll-into-view':
                return () => {
                    browser.$(this.testCase.resolvedSelector).scrollIntoView();
                };
            case 'scroll-to-top':
                return () => {
                    browser.$(this.testCase.resolvedSelector).scrollIntoView({inline: 'start', block: 'start'});
                };
            case 'pause':
                return () => {
                    let pauseFor = this.getParam(taskDef, 'for', null);
                    if (pauseFor) {
                        if (typeof pauseFor === 'object') {
                            if (pauseFor.random) {
                                const [from, to] = pauseFor.random;
                                const r = Math.random();
                                pauseFor = Math.round(r * (to - from) + from);
                            } else {
                                console.warn('Invalid pause.for', pauseFor);
                                pauseFor = DEFAULT_PAUSE_FOR;
                            }
                        }
                    } else {
                        pauseFor = DEFAULT_PAUSE_FOR;
                    }
                    browser.pause(pauseFor);
                };
            case 'setValue':
                return () => {
                    browser.setValue(this.testCase.resolvedSelector, this.getParam(taskDef, 'value'));
                };
            case 'setLocal':
                return () => {
                    if (!this.context.local) {
                        this.context.local = {};
                    }
                    this.context.local[this.taskDef.name] = this.taskDef.value;
                };
            case 'echo':
            case 'log':
                return () => {
                    // eslint-disable-next-line no-console
                    console.log('LOG', this.getParam(taskDef, 'text'));
                };
            default:
                throw new Error('Unknown task action: "' + taskDef.action + '"');
            }
        } else {
            throw new Error('Missing action in task "' + taskDef.title || 'no title' + '"');
        }
    }

    waitFunc(taskDef) {
        switch (taskDef.wait) {
        case 'forText':
            return () => {
                if (!browser.$(taskDef.resolvedSelector).isExisting()) {
                    return false;
                }
                const nodeValue = browser.$(taskDef.resolvedSelector).getText();
                const testValue = this.getParam(taskDef, 'text');
                return nodeValue === testValue;
            };
        case 'forTextMatch':
        case 'forTextRegex':
            return () => {
                if (!browser.$(taskDef.resolvedSelector).isExisting()) {
                    return false;
                }
                const nodeValue = browser.$(taskDef.resolvedSelector).getText();
                const regexpString = this.getParam(taskDef, ['value', 'text', 'regexp']);
                const testValue = new RegExp(regexpString, this.getParam(taskDef, 'flags', ''));
                return testValue.test(nodeValue);
            };
        case 'forNumber':
            return () => {
                if (!browser.$(taskDef.resolvedSelector).isExisting()) {
                    return false;
                }
                var text = browser.$(taskDef.resolvedSelector).getText();
                if (!text) {
                    return false;
                }
                const value = Number(text.replace(/,/g, ''));
                if (Number.isNaN(value)) {
                    return false;
                }
                const param = this.getParam(taskDef, 'number')
                return utils.isValidNumber(value, param);
            };
        case 'forCount':
        case 'forElementCount':
            return () => {
                try {
                    if (!browser.$(taskDef.resolvedSelector).isExisting()) {
                        return false;
                    }
                    const els = browser.$$(taskDef.resolvedSelector);
                    const count = els.length;
                    const param = this.getParam(taskDef, 'count');
                    return utils.isValidNumber(count, param);
                } catch (ex) {
                    return false;
                }
            };
        case 'forPlugin':
            return () => {
                try {
                    browser.switchToFrame(null);
                    browser.switchToFrame(browser.$('[data-k-b-testhook-iframe="plugin-iframe"]'));
                    if (!browser.$(taskDef.resolvedSelector).isExisting()) {
                        return false;
                    }
                    return true;
                } catch (ex) {
                    return false;
                }
            };
        case 'forElement':
        default:
            return () => {
                return browser.$(taskDef.resolvedSelector).isExisting();
            };
        }
    }

    doTask(taskDef) {
        // Primary tasks types are
        // switching to a window
        // setting a base selector
        // waiting for appearance, text, or number
        //

        if (taskDef.selector) {
            // selector based actions
            taskDef.resolvedSelector = this.makeSelector(taskDef.selector);
            this.testCase.resolvedSelector = taskDef.resolvedSelector;
        }

        if (taskDef.wait) {
            const waitFunction = this.waitFunc(taskDef);
            const timeout = taskDef.timeout || DEFAULT_TASK_TIMEOUT;
            browser.waitUntil(waitFunction, timeout);
        } else if (taskDef.action) {
            const actionFunction = this.actionFunc(taskDef);
            actionFunction();
        } else if (taskDef.loop) {
            this.loopFunc(taskDef);
        }
    }

    interpValue(value) {
        if (!value) {
            return value;
        }
        if (typeof value !== 'string') {
            return value;
        }

        const template = handlebars.compile(value);
        const result = template(this.context);
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

        const nth = (() => {
            if (!element.nth) {
                return '';
            }
            const theNth = this.interpValue(element.nth);
            if (isNaN(theNth)) {
                console.error('Value provided for "nth" is not a number: ', element.nth, (typeof theNth), theNth);
                throw new Error('Value provided for "nth" is not a number: ' + (typeof theNth));
            }

            return `:nth-child(${this.interpValue(element.nth)})`;
        })();

        const elementType = element.elementType || '';

        if (element.type) {
            switch (element.type) {
                case 'raw':
                    return `${elementType}[${element.name}="${this.interpValue(element.value)}"]${nth}`;
                case 'id':
                    return `#${element.value}`;
                case 'class':
                    return `.${element.value.split(/\s+/).join('.')}`;
                case 'tag':
                    return `${element.value}`;
                case 'selector':
                    return element.selector;
                default: 
                    return `${elementType}[data-k-b-testhook-${element.type}="${this.interpValue(element.value)}"]${nth}`;
            }
        } else if (elementType) {
            return `${elementType}${nth}`;
        } else if (element.echo) {
            console.warn('ECHO', element.echo, this.interpValue(element.echo));
        } else {
            console.error('Not enough info in this path element', element);
            throw new Error('Not enough info in this path element');
        }
    }

    buildSelector(path) {
        const selector = path
            .map((element) => {
                return this.buildAttribute(element);
            })
            .join(' ');
        return selector;
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
            fullPath = utils.extend(this.testCase.baseSelector || [], selector.path);
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
