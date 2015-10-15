/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define(['underscore'], function (_) {
    'use strict';
    return (function () {

        function jsonToHTML(node) {
            var nodeType = typeof node,
                out;
            if (nodeType === 'string') {
                return node;
            }
            if (nodeType === 'boolean') {
                if (node) {
                    return 'true';
                }
                return 'false';
            }
            if (nodeType === 'number') {
                return String(node);
            }
            if (nodeType === 'object' && node.push) {
                out = '';
                node.forEach(function (item) {
                    out += jsonToHTML(item);
                });
                return out;
            }
            if (nodeType === 'object') {
                out = '';
                out += '<' + nodeType.tag;
                if (node.attributes) {
                    node.attributes.keys().forEach(function (key) {
                        out += key + '="' + node.attributes[key] + '"';
                    });
                }
                out += '>';
                if (node.children) {
                    out += jsonToHTML(node.children);
                }
                out += '</' + node.tag + '>';
                return out;
            }
        }

        var tags = {};
        /**
         * Given a simple object of keys and values, create a string which 
         * encodes them into a form suitable for the value of a style attribute.
         * Style attribute values are themselves attributes, but due to the limitation
         * of html attributes, they are embedded in a string:
         * The format is
         * key: value;
         * Note that values are not quoted, and the separator between fields is
         * a semicolon
         * Note that we expect the value to be embedded withing an html attribute
         * which is quoted with double-qoutes; but we don't do any escaping here.
         * @param {type} attribs
         * @returns {String}
         */
        function camelToHyphen(s) {
            return s.replace(/[A-Z]/g, function (m) {
                return '-' + m.toLowerCase();
            });
        }
        function makeStyleAttribs(attribs) {
            if (attribs) {
                var fields = Object.keys(attribs).map(function (key) {
                    var value = attribs[key],
                        key = camelToHyphen(key);

                    if (typeof value === 'string') {
                        return key + ': ' + value;
                    }
                    // just ignore invalid attributes for now
                    // TODO: what is the proper thing to do?
                    return '';
                });
                return fields.filter(function (field) {
                    return field ? true : false;
                }).join('; ');
            }
            return '';
        }

        /**
         * The attributes for knockout's data-bind is slightly different than
         * for style. The syntax is that of a simple javascript object.
         * property: value, property: "value", property: 123
         * So, we simply escape double-quotes on the value, so that unquoted values
         * will remain as raw names/symbols/numbers, and quoted strings will retain
         * the quotes.
         * TODO: it would be smarter to detect if it was a quoted string
         * 
         * @param {type} attribs
         * @returns {String}
         */
        function makeDataBindAttribs(attribs) {
            if (attribs) {
                var fields = Object.keys(attribs).map(function (key) {
                    var value = attribs[key];
                    if (typeof value === 'string') {
                        //var escapedValue = value.replace(/\"/g, '\\"');
                        return key + ':' + value;
                    }
                    if (typeof value === 'object') {
                        return key + ': {' + makeDataBindAttribs(value) + '}';
                    }
                    // just ignore invalid attributes for now
                    // TODO: what is the proper thing to do?
                    return '';
                });
                return fields.filter(function (field) {
                    return field ? true : false;
                }).join(',');
            }
            return '';
        }

        /**
         * Given a simple object of keys and values, create a string which 
         * encodes a set of html tag attributes.
         * String values escape the "
         * Boolean values either insert the attribute name or not
         * Object values are interpreted as "embedded attributes" (see above)
         * @param {type} attribs
         * @returns {String}
         */
        function makeTagAttribs(attribs) {
            var quoteChar = '"';
            if (attribs) {
                var fields = Object.keys(attribs).map(function (key) {
                    var value = attribs[key],
                        attribName = camelToHyphen(key);
                    if (typeof value === 'object') {
                        switch (attribName) {
                            case 'style':
                                value = makeStyleAttribs(value);
                                break;
                            case 'data-bind':
                                // reverse the quote char, since data-bind attributes 
                                // can contain double-quote, which can't itself
                                // be quoted.
                                quoteChar = "'";
                                value = makeDataBindAttribs(value);
                                break;
                        }
                    }
                    if (typeof value === 'string') {
                        var escapedValue = value.replace(new RegExp('\\' + quoteChar, 'g'), '\\' + quoteChar);
                        return attribName + '=' + quoteChar + escapedValue + quoteChar;
                    } else if (typeof value === 'boolean') {
                        if (value) {
                            return attribName;
                        }
                    } else if (typeof value === 'number') {
                        return attribName + '=' + quoteChar + String(value) + quoteChar;
                    }
                    return false;
                });
                return fields.filter(function (field) {
                    return field ? true : false;
                }).join(' ');
            } else {
                return '';
            }
        }
        function renderContent(children) {
            if (children) {
                if (_.isString(children)) {
                    return children;
                } else if (_.isNumber(children)) {
                    return String(children);
                } else if (_.isArray(children)) {
                    return children.map(function (item) {
                        return renderContent(item);
                    }).join('');
                }
            } else {
                return '';
            }
        }
        function tag(tagName, options) {
            options = options || {};
            if (!tags[tagName]) {
                tags[tagName] = function (attribs, children) {
                    var node = '<' + tagName;
                    if (_.isArray(attribs)) {
                        // skip attribs, just go to children.
                        children = attribs;
                    } else if (_.isString(attribs)) {
                        // skip attribs, just go to children.
                        children = attribs;
                    } else if (_.isNull(attribs) || _.isUndefined(attribs)) {
                        children = '';
                    } else if (_.isObject(attribs)) {
                        var tagAttribs = makeTagAttribs(attribs);
                        if (tagAttribs && tagAttribs.length > 0) {
                            node += ' ' + tagAttribs;
                        }
                    } else if (!attribs) {
                        // Do nothing.
                    } else if (_.isNumber(attribs)) {
                        children = '' + attribs;
                    } else if (_.isBoolean(attribs)) {
                        if (attribs) {
                            children = 'true';
                        } else {
                            children = 'false';
                        }
                    } else {
                        throw 'Cannot make tag ' + tagName + ' from a ' + (typeof attribs);
                    }

                    node += '>';
                    if (options.close !== false) {
                        node += renderContent(children);
                        node += '</' + tagName + '>';
                    }
                    return node;
                };
            }
            return tags[tagName];
        }
        var generatedId = 0;
        function genId() {
            generatedId += 1;
            return 'kb_html_' + generatedId;
        }
        function makeTablex(columns, rows, options) {
            var table = tag('table'),
                thead = tag('thead'),
                tbody = tag('tbody'),
                tr = tag('tr'),
                th = tag('th'),
                td = tag('td');
            var id;
            options = options || {};
            if (options.id) {
                id = options.id;
            } else {
                id = genId();
                options.generated = {id: id};
            }
            return table({id: id, class: options.class}, [
                thead(tr(columns.map(function (x) {
                    return th(x);
                }))),
                tbody(rows.map(function (row) {
                    return tr(row.map(function (x) {
                        return td(x);
                    }));
                }))
            ]);
        }

        function makeTable(arg) {
            var table = tag('table'),
                thead = tag('thead'),
                tbody = tag('tbody'),
                tr = tag('tr'),
                th = tag('th'),
                td = tag('td');
            var id;
            arg = arg || {};
            if (arg.id) {
                id = arg.id;
            } else {
                id = genId();
                arg.generated = {id: id};
            }
            var attribs = {id: id};
            if (arg.class) {
                attribs.class = arg.class;
            } else if (arg.classes) {
                attribs.class = arg.classes.join(' ');
            }
            return table(attribs, [
                thead(tr(arg.columns.map(function (x) {
                    return th(x);
                }))),
                tbody(arg.rows.map(function (row) {
                    return tr(row.map(function (x) {
                        return td(x);
                    }));
                }))
            ]);
        }

        function bsPanel(title, content) {
            var div = tag('div'),
                span = tag('span');

            return div({class: 'panel panel-default'}, [
                div({class: 'panel-heading'}, [
                    span({class: 'panel-title'}, title)
                ]),
                div({class: 'panel-body'}, [
                    content
                ])
            ]);
        }

        function makePanel(arg) {
            var div = tag('div'),
                span = tag('span'),
                klass = arg.class || 'default';

            return div({class: 'panel panel-' + klass}, [
                div({class: 'panel-heading'}, [
                    span({class: 'panel-title'}, arg.title)
                ]),
                div({class: 'panel-body'}, [
                    arg.content
                ])
            ]);
        }

        function loading(msg) {
            var span = tag('span'),
                img = tag('img'),
                i = tag('i'),
                prompt;
            if (msg) {
                prompt = msg + '... &nbsp &nbsp';
            }
            return span([
                prompt,
                i({class: 'fa fa-spinner fa-pulse fa-2x fa-fw margin-bottom'})
            ]);
        }
        // <i class="fa fa-spinner fa-pulse fa-3x fa-fw margin-bottom"></i>
        // img({src: '/images/ajax-loader.gif'})

        /*
         * 
         */
        function makeRotatedTable(data, columns) {
            function columnLabel(column) {
                var key;
                if (column.label) {
                    return column.label;
                }
                if (typeof column === 'string') {
                    key = column;
                } else {
                    key = column.key;
                }
                return key
                    .replace(/(id|Id)/g, 'ID')
                    .split(/_/g).map(function (word) {
                    return word.charAt(0).toUpperCase() + word.slice(1);
                })
                    .join(' ');
            }
            function columnValue(row, column) {
                var rawValue = row[column.key];
                if (column.format) {
                    return column.format(rawValue);
                }
                if (column.type) {
                    switch (column.type) {
                        case 'bool':
                            // yuck, use truthiness
                            if (rawValue) {
                                return 'True';
                            }
                            return 'False';
                        default:
                            return rawValue;
                    }
                }
                return rawValue;
            }

            var table = tag('table'),
                tr = tag('tr'),
                th = tag('th'),
                td = tag('td');
            var result = table({class: 'table table-stiped table-bordered'},
                columns.map(function (column) {
                    return tr([
                        th(columnLabel(column)), data.map(function (row) {
                            return td(columnValue(row, column));
                        })
                    ]);
                }));
            return result;
        }

        function flatten(html) {
            if (_.isString(html)) {
                return html;
            } else if (_.isArray(html)) {
                return html.map(function (h) {
                    return flatten(h);
                }).join('');
            } else {
                throw new Error('Not a valid html representation -- must be string or list');
            }
        }

        function makeList(arg) {
            if (_.isArray(arg.items)) {
                var ul = tag('ul'),
                    li = tag('li');
                return ul(arg.items.map(function (item) {
                    return li(item);
                }));
            }
            return 'Sorry, cannot make a list from that';
        }

        function makeTabs(arg) {
            var ul = tag('ul'),
                li = tag('li'),
                a = tag('a'),
                div = tag('div');

            return div([
                ul({class: 'nav nav-tabs', role: 'tablist'},
                    arg.tabs.map(function (tab, index) {
                        var attribs = {
                            role: 'presentation'
                        };
                        if (index === 0) {
                            attribs.class = 'active';
                        }
                        return li(attribs, a({
                            href: '#' + tab.id,
                            'aria-controls': 'home',
                            role: 'tab',
                            'data-toggle': 'tab'
                        }, tab.label));
                    })),
                div({class: 'tab-content'},
                    arg.tabs.map(function (tab, index) {
                        var attribs = {
                            role: 'tabpanel',
                            class: 'tab-pane',
                            id: tab.id
                        };
                        if (index === 0) {
                            attribs.class += ' active';
                        }
                        return div(attribs, tab.content);
                    })
                    )
            ]);
        }

        return {
            html: jsonToHTML,
            tag: tag,
            makeTable: makeTable,
            makeRotatedTable: makeRotatedTable,
            genId: genId,
            bsPanel: bsPanel,
            panel: bsPanel,
            makePanel: makePanel,
            loading: loading,
            flatten: flatten,
            makeList: makeList,
            makeTabs: makeTabs
        };
    }());
});