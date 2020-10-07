define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML = void 0;
    ;
    var HTML = /** @class */ (function () {
        function HTML() {
            // todo: figure out how to get ts packages in here...
            this.genIdSerial = 0;
        }
        HTML.prototype.renderChildren = function (children) {
            if (children === null) {
                return '';
            }
            if (typeof children === 'string') {
                return children;
            }
            if (typeof children === 'number') {
                return String(children);
            }
            if (!(children instanceof Array)) {
                throw new Error('hmm, not an array? ' + typeof children);
            }
            var that = this;
            return children.map(function (child) {
                return that.renderChildren(child);
            }).join('');
        };
        HTML.prototype.styleAttribsToString = function (attribs) {
            var that = this;
            return Object.keys(attribs).map(function (key) {
                var value = attribs[key];
                var attribValue = value;
                var attribName = key.replace(/[A-Z]/g, function (m) {
                    return '-' + m.toLowerCase();
                });
                return [attribName, attribValue].join(': ');
            }).join('; ');
        };
        HTML.prototype.attribsToString = function (attribs) {
            var that = this;
            return Object.keys(attribs).map(function (key) {
                var value = attribs[key];
                var attribValue;
                if (typeof value === 'string') {
                    attribValue = '"' + value.replace(/"/, '""') + '"';
                }
                else {
                    attribValue = '"' + that.styleAttribsToString(value) + '"';
                }
                var attribName = key.replace(/[A-Z]/g, function (m) {
                    return '-' + m.toLowerCase();
                });
                return [attribName, attribValue].join('=');
            }).join(' ');
        };
        HTML.prototype.mergeAttribs = function (a, b) {
            // ensure we can merge even if the base is not mergable...
            if (typeof a === 'undefined') {
                a = {};
            }
            var merger = function (x, y) {
                // 0. Only merge if y is an object, otherwise just skip it.
                if (typeof y === 'object' && y !== null) {
                    Object.keys(y).forEach(function (key) {
                        var xval = x[key];
                        var yval = y[key];
                        // 1. if no target property, just set it.
                        if (typeof xval === 'undefined') {
                            x[key] = yval;
                        }
                        else if (typeof xval === 'object' && xval !== null) {
                            // 2. If both values are  objects, recursively merge
                            if (typeof yval === 'object' && yval !== null) {
                                merger(xval, yval);
                            }
                            else {
                                // 3. If the x value is an object and y value is not, then replace the value for the x property
                                x[key] = yval;
                            }
                        }
                        else {
                            // 4. in all other cases (x's property is a simple value) replace it.
                            x[key] = yval;
                        }
                    });
                }
            };
            merger(a, b);
            return a;
        };
        // first port will only support strict arguments - attribs, children.
        HTML.prototype.tagMaker = function () {
            var _this = this;
            var isHtmlNode = function (val) {
                return true;
            };
            var isAttribMap = function (val) {
                return true;
            };
            var notEmpty = function (x) {
                if ((typeof x === 'undefined') ||
                    (x === null) ||
                    x.length === 0) {
                    return false;
                }
                return true;
            };
            var maker = function (name, defaultAttribs) {
                if (defaultAttribs === void 0) { defaultAttribs = {}; }
                var tagFun = function (attribs, children) {
                    var node = '<';
                    // case 1. one argument, first may be attribs or content, but attribs if object.
                    if (typeof children === 'undefined') {
                        if (typeof attribs === 'object' &&
                            !(attribs instanceof Array) &&
                            isAttribMap(attribs)) {
                            if (Object.keys(attribs).length === 0) {
                                node += name;
                            }
                            else {
                                var tagAttribs = _this.attribsToString(_this.mergeAttribs(attribs, defaultAttribs));
                                node += [name, tagAttribs].filter(notEmpty).join(' ');
                            }
                            node += '>';
                            // case 2. arity 1, is undefined
                        }
                        else if (typeof attribs === 'undefined') {
                            var tagAttribs = _this.attribsToString(defaultAttribs);
                            node += [name, tagAttribs].filter(notEmpty).join(' ');
                            node += '>';
                            // case 3: arity 1, is content
                        }
                        else if (isHtmlNode(attribs)) {
                            var tagAttribs = _this.attribsToString(defaultAttribs);
                            node += [name, tagAttribs].filter(notEmpty).join(' ');
                            node += '>' + _this.renderChildren(attribs);
                        }
                        // case 4. arity 2 - atribs + content
                    }
                    else if (typeof attribs !== 'undefined' && isAttribMap(attribs) && isHtmlNode(children)) {
                        if (Object.keys(attribs).length === 0) {
                            node += name;
                        }
                        else {
                            var tagAttribs = _this.attribsToString(_this.mergeAttribs(attribs, defaultAttribs));
                            node += [name, tagAttribs].filter(notEmpty).join(' ');
                        }
                        node += '>' + _this.renderChildren(children);
                    }
                    node += '</' + name + '>';
                    return node;
                };
                return tagFun;
            };
            return maker;
        };
        HTML.prototype.genId = function () {
            var random = Math.floor(Math.random() * 1000);
            var time = new Date().getTime();
            if (this.genIdSerial === 1000) {
                this.genIdSerial = 0;
            }
            this.genIdSerial += 1;
            return [random, time, this.genIdSerial].map(String).join('-');
        };
        return HTML;
    }());
    exports.HTML = HTML;
});
