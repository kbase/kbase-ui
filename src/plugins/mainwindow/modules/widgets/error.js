define([
    'kb_common/html'
], function (
    html
) {
    'use strict';

    const serviceError = {
            error: {
                type: 'object',
                value: {
                    code: { type: 'number' },
                    error: { type: ['string', null] },
                    message: { type: 'string' },
                    name: { type: 'string' }
                }
            },
            status: { type: 'number' }
        },
        error1 = {
            error: {
                type: 'object',
            },
            title: {
                type: 'string'
            }
        },
        uiError = {
            type: { type: 'string' },
            reason: { type: 'string' },
            blame: { type: 'string' },
            message: { type: 'string' },
            suggestions: { type: 'string' }
        },
        codeError = {
            message: { type: 'string' },
            stack: { type: 'string' },
            sourceURL: { type: 'string' },
            column: { type: 'number' },
            line: { type: 'number' }
        };
        
    const t = html.tag,
        div = t('div');

    function isType(obj, shape) {
        function matchType(value, def) {
            if (typeof value !== def.type) {
                return true;
            }
        }

        // walk the def and object, ensuring that the object matches the def.
        // stop at leaves of def (meaning that it may leave bits of the object
        // unspecified)
        function compare(obj, def) {
            var keys = Object.keys(def);
            for (var i = 0; i < keys.length; i += 1) {
                var defKey = keys[i];
                var defProp = def[defKey];
                var objProp = obj[defKey];

                if (obj[defProp] === undefined) {
                    return false;
                }
                // simple type comparison, to be improved.
                if (!matchType(objProp, defProp)) {
                    return false;
                }

                // objects or arrays are inspected recursively.
                if (typeof objProp === 'object' && objProp !== null) {
                    if (defProp.value) {
                        return compare(objProp, defProp.value);
                    }
                }
                return true;
            }
        }

        return compare(obj, shape);
    }

    class ErrorWidget {
        constructor() {
            this.hostNode = null;
            this.container = null;
        }

        render(params) {
            let error;
            if (typeof params.error === 'string') {
                error = {
                    message: params.error
                };
            } else if (isType(params.error, serviceError)) {
                error = {
                    type: params.error.error.name,
                    message: params.error.error.message,
                    reason: params.error.error.error
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
            } else if (isType(params.error, error1)) {
                error = {
                    message: params.error.error.message
                };
            } else if (params.error instanceof Error) {
                error = {
                    message: params.error.message
                };
            } else {
                error = {
                    type: 'Unknown',
                    message: error && error.message
                };
            }

            // We need to always emit an error to the console. The original
            // error catch may also emit the error to console.error.
            console.error(error);

            if (error.extra) {
                error.extended = html.makeObjTable([error.extra], { rotated: true });
            }

            return div({
                class: 'container-fluid',
                dataWidget: 'error'
            }, html.makePanel({
                title: params.title,
                class: 'danger',
                content: html.makeObjTable([error], { rotated: true })
            }));
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
        }

        start(params) {
            this.container.innerHTML = this.render(params);
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return {Widget: ErrorWidget};
});
