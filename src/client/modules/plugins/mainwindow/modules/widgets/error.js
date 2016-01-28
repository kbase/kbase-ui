/*global define */
/*jslint white:true,browser:true */
define([
    'kb/common/html',
    'kb/common/dom'
], function (html, dom) {
    'use strict';

    var serviceError = {
        error: {
            type: 'object',
            value: {
                code: {type: 'number'},
                error: {type: 'string'},
                message: {type: 'string'},
                name: {type: 'string'}
            }
        },
        status: {type: 'number'}
    },
    uiError = {
        type: {type: 'string'},
        reason: {type: 'string'},
        blame: {type: 'string'},
        message: {type: 'string'},
        suggestions: {type: 'string'}
    },
    codeError = {
        message: {type: 'string'},
        stack: {type: 'string'},
        sourceURL: {type: 'string'},
        column: {type: 'number'},
        line: {type: 'number'}
    },
    t = html.tag,
        div = t('div');

    function isType(obj, shape) {
        function compare(obj, def) {
            return Object.keys(def).some(function (prop) {
                // simply reject if not define.
                if (def[prop] === undefined) {
                    return true;
                }
                // simple type comparison, to be improved.
                if (typeof obj[prop] !== def[prop].type) {
                    return true;
                }

                // objects or arrays are inspected recursively.
                if (typeof obj[prop] === 'object' && obj[prop] !== null) {
                    return compare(obj[prop], def[prop].value);
                }
                return false;
            });
        }
        return !compare(obj, shape);
    }


    function factory(config) {
        var mount, container, runtime = config.runtime;

        // IMPL

        function render(params) {
            var error;
            if (typeof params.error === 'string') {
                error = {
                    message: params.error
                };
            } else if (isType(params.error, serviceError)) {
                error = {
                    type: params.error.error.name,
                    message: params.error.error.error,
                    reason: params.error.error.message
                };
            } else if (isType(params.error, uiError)) {
                // hope it is a compatible obje
                error = params.error;
            } else if (isType(params.error, codeError)) {
                error = {
                    type: 'CodeError',
                    message: params.error.message,
                    reason: params.error.stack,
                    extra: {
                        sourceURL: params.error.sourceURL,
                        line: params.error.line,
                        column: params.error.column
                    }
                };
            } else if (params.error instanceof Error) {
                error = {
                    message: params.error.message
                };
            } else {
                error = {
                    type: 'Unknown',
                    message: error.message
                };
            }

            // We need to always emit an error to the console. The original
            // error catch may also emit the error to console.error.            
            console.error('ERROR');
            console.error(params.error);
            console.error(error);
            if (params.error.data) {
                console.error(params.error.data);
            }

            if (error.extra) {
                error.extended = html.makeObjTable([error.extra], {rotated: true});
            }

            return div({class: 'container-fluid'}, html.makePanel({
                title: params.title,
                class: 'danger',
                content: html.makeObjTable([error], {rotated: true})
            }));
        }

        // API

        function attach(node) {
            mount = node;
            container = dom.createElement('div');
            mount.appendChild(container);
        }

        function start(params) {
            container.innerHTML = render(params);
        }

        function stop() {
            // nothing to do?
        }

        function detach() {
            if (mount && container) {
                mount.removeChild(container);
            }
        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});