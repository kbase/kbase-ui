define([
    'knockout',
    'kb_common/html',
    'numeral'
], function (
    ko,
    html,
    numeral
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        span = t('span');

    function niceNumber(key, num) {
        if (Number.isInteger(num)) {
            if (!/_id$/.exec(key)) {
                return numeral(num).format('0,0');
            } else {
                return num;
            }
        } else {
            return num;
        }
    }

    function makeBrowsable(key, obj, forceOpen) {
        switch (typeof obj) {
        case 'string':
            return {
                type: typeof obj,
                key: key,
                value: obj,
                display: String(obj)
            };
        case 'number':
            return {
                type: typeof obj,
                key: key,
                value: niceNumber(key, obj),
                display: String(obj)
            };
        case 'boolean':
            return {
                type: typeof obj,
                key: key,
                value: obj,
                display: String(obj)
            };
        case 'object':
            if (obj === null) {
                return {
                    type: 'null',
                    key: key,
                    value: obj,
                    display: 'null'
                };
            } else if (obj instanceof Array) {
                return {
                    type: 'array',
                    key: key,
                    show: ko.observable(forceOpen || false),
                    value: obj.map(function (element) {
                        // return makeBrowsable(element);
                        return element;
                    })
                };
            } else {
                return {
                    type: 'object',
                    show: ko.observable(forceOpen || false),
                    key: key,
                    value: Object.keys(obj).map(function (key) {
                        return {
                            key: key,
                            value: obj[key]
                        };
                    }).sort(function (a, b) {
                        if (a.key < b.key) {
                            return -1;
                        } else if (a.key > b.key) {
                            return 1;
                        }
                        return 0;
                    })
                };
            }
        default:
            return {
                type: 'unknown',
                key: key,
                value: 'type not handled: ' + (typeof obj),
                display: 'type not handled: ' + (typeof obj)
            };
        }
    }

    function viewModel(params) {
        var value = params.value;
        var browsable = makeBrowsable(params.key, value, params.open);
        var open = params.open;
        return {
            key: params.key,
            value: value,
            level: params.level || 0,
            browsable: browsable,
            open: open
        };
    }

    function icon(name) {
        return span({
            class: 'fa fa-' + name,
            style: {
                fontSize: '80%'
            }
        });
    }

    function template() {
        return div({
            dataBind: {
                style: {
                    'margin-left': 'String(level * 5) + "px"'
                },
                with: 'browsable'
            }
        }, [
            '<!-- ko if: type === "object"-->',
            div({

            }, [
                '<!-- ko if: value.length === 0 -->',
                div({
                    style: {
                        color: 'gray'
                    }
                }, [
                    span({
                        class: 'mini-spacer'
                    }),
                    span({
                        dataBind: {
                            text: 'key'
                        }
                    }),
                    ': (empty)'
                ]),
                '<!-- /ko -->',
                '<!-- ko if: value.length !== 0 -->',

                div([
                    span({
                        dataBind: {
                            click: 'function (data) {show(!show());}',
                            style: {
                                color: 'show() ? "red" : "green"'
                            }
                        },
                        class: 'mini-button'
                    }, [
                        span({
                            dataBind: {
                                ifnot: 'show'
                            }
                        }, icon('plus')),
                        span({
                            dataBind: {
                                if: 'show'
                            }
                        }, icon('minus'))
                    ]),
                    ' ',
                    span({
                        dataBind: {
                            text: 'key'
                        }
                    }),
                    ':'
                ]),
                '<!-- ko if: show-->',
                div({
                    dataBind: {
                        foreach: 'value'
                    }
                }, [
                    // div({
                    //     dataBind: {
                    //         text: 'key'
                    //     }
                    // }),
                    div({
                        dataBind: {
                            component: {
                                name: '"generic/json-viewer"',
                                params: {
                                    key: 'key',
                                    value: 'value',
                                    level: '$component.level + 1'
                                }
                            }
                        }
                    })
                ]),
                '<!-- /ko -->',
                '<!-- /ko -->'
            ]),
            '<!-- /ko -->',
            '<!-- ko if: type === "array"-->',
            div({}, [
                '<!-- ko if: value.length === 0 -->',
                span({
                    style: {
                        color: 'gray'
                    }
                }, [
                    span({
                        class: 'mini-spacer'
                    }),
                    span({
                        dataBind: {
                            text: 'key'
                        }
                    }),
                    ': (empty)'
                ]),
                '<!-- /ko -->',
                '<!-- ko if: value.length !== 0 -->',
                div([
                    div({
                        dataBind: {
                            click: 'function (data) {show(!show());}',
                            style: {
                                color: 'show() ? "red" : "green"'
                            }
                        },
                        class: 'mini-button'
                    }, [
                        span({
                            dataBind: {
                                ifnot: 'show'
                            }
                        }, icon('plus')),
                        span({
                            dataBind: {
                                if: 'show'
                            }
                        }, icon('minus'))
                    ]),
                    span({
                        dataBind: {
                            text: 'key'
                        }
                    }),
                    ':'
                ]),

                '<!-- ko if: show -->',
                div({
                    dataBind: {
                        foreach: 'value'
                    }
                }, [
                    // div([
                    //     '[',
                    //     span({
                    //         dataBind: {
                    //             text: '$index'
                    //         }
                    //     }),
                    //     ']'
                    // ]),
                    div({
                        dataBind: {
                            component: {
                                name: '"generic/json-viewer"',
                                params: {
                                    key: '"[" + $index() + "]"',
                                    value: '$data',
                                    level: '$component.level + 1'
                                }
                            }
                        }
                    })
                ]),
                '<!-- /ko -->',
                '<!-- /ko -->'
            ]),
            '<!-- /ko -->',
            '<!-- ko if: type === "string"-->',
            div([
                span({
                    class: 'mini-spacer'
                }),
                span({
                    dataBind: {
                        text: 'key'
                    }
                }),
                ': ',
                span({
                    dataBind: {
                        text: 'value'
                    },
                    style: {
                        fontWeight: 'bold',
                        color: 'green'
                    }
                })
            ]),
            '<!-- /ko -->',
            '<!-- ko if: type === "number"-->',
            div([
                span({
                    class: 'mini-spacer'
                }),
                span({
                    dataBind: {
                        text: 'key'
                    }
                }),
                ': ',
                span({
                    dataBind: {
                        text: 'String(value)'
                    },
                    style: {
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        color: 'blue'
                    }
                })
            ]),
            '<!-- /ko -->',

            '<!-- ko if: type === "boolean"-->',
            div([
                span({
                    class: 'mini-spacer'
                }),
                span({
                    dataBind: {
                        text: 'key'
                    }
                }),
                ': ',
                span({
                    dataBind: {
                        text: 'value ? "true" : "false"'
                    },
                    style: {
                        fontWeight: 'bold',
                        color: 'orange'
                    }
                })
            ]),

            '<!-- /ko -->',
            '<!-- ko if: type === "null"-->',

            div([
                span({
                    class: 'mini-spacer'
                }),
                span({
                    dataBind: {
                        text: 'key'
                    }
                }),
                ': ',
                span({
                    dataBind: {
                        text: 'display'
                    },
                    style: {
                        fontWeight: 'bold',
                        color: 'gray'
                    }
                })
            ]),

            '<!-- /ko -->',
            '<!-- ko if: type === "unknown"-->',
            div([
                span({
                    class: 'mini-spacer'
                }),
                span({
                    dataBind: {
                        text: 'key'
                    }
                }),
                ': ',
                span({
                    dataBind: {
                        text: 'value'
                    },
                    style: {
                        fontWeight: 'bold',
                        color: 'red'
                    }
                })
            ]),
            '<!-- /ko -->',

        ]);

        // return div({
        //     dataBind: {
        //         foreach: 'browsable'
        //     }
        // }, [
        //     '<!-- ko if: type === "object"',
        //     div({
        //         dataBind: {
        //             text: 'display'
        //         }
        //     })
        // ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }
    return component;
});
