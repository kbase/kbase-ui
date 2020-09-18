define([], () => {


    // type HtmlNode = null | string | number | HtmlNodeArray;

    // interface HtmlNodeArray extends Array<HtmlNode> {};

    // interface ITag {
    //     (attribs : AttribMap, children : HtmlNode) : string
    // }

    // // type AttribMap = {key:string, value: string | number | boolean}


    // interface StyleAttribMap {
    //     [key: string]: string
    // }

    // interface AttribMap {
    //     [key: string]: string | StyleAttribMap
    // }

    class Html {
        constructor() {
        }

        renderChildren(children) {
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
            const that = this;
            return children.map((child) => {
                return that.renderChildren(child);
            }).join('');
        }

        styleAttribsToString(attribs) {
            return Object.keys(attribs).map((key) => {
                const value = attribs[key];
                const attribValue = value;
                const attribName =  key.replace(/[A-Z]/g, (m) => {
                    return '-' + m.toLowerCase();
                });
                return [attribName, attribValue].join(': ');
            }).join('; ');
        }

        attribsToString(attribs) {
            const that = this;

            return Object.keys(attribs).map((key) => {
                const value = attribs[key];
                var attribValue;
                if (typeof value === 'string') {
                    attribValue = '"' + value.replace(/"/, '""') + '"';
                } else {
                    attribValue = '"' + that.styleAttribsToString(value) + '"';
                }
                const attribName =  key.replace(/[A-Z]/g, (m) => {
                    return '-' + m.toLowerCase();
                });
                return [attribName, attribValue].join('=');
            }).join(' ');
        }

        mergeAttribs(a, b) {
            // ensure we can merge even if the base is not mergable...
            if (typeof a === 'undefined') {
                a = {};
            }
            const merger = (x, y) => {
                // 0. Only merge if y is an object, otherwise just skip it.
                if (typeof y === 'object' && y !== null) {
                    Object.keys(y).forEach((key) => {
                        var xval = x[key];
                        var yval = y[key];
                        // 1. if no target property, just set it.
                        if (typeof xval === 'undefined') {
                            x[key] = yval;
                        } else if (typeof xval === 'object' && xval !== null) {
                            // 2. If both values are  objects, recursively merge
                            if (typeof yval === 'object' && yval !== null) {
                                merger(xval, yval);
                            } else {
                                // 3. If the x value is an object and y value is not, then replace the value for the x property
                                x[key] = yval;
                            }
                        } else {
                            // 4. in all other cases (x's property is a simple value) replace it.
                            x[key] = yval;
                        }
                    });
                }
            };
            merger(a, b);
            return a;
        }

        // first port will only support strict arguments - attribs, children.
        tagMaker() {
            const isHtmlNode = () => {
                return true;
            };
            const isAttribMap = () => {
                return true;
            };
            var notEmpty = (x) => {
                if ((typeof x === 'undefined') ||
                    (x === null) ||
                    x.length === 0) {
                    return false;
                }
                return true;
            };
            var maker = (name, defaultAttribs = {}) => {
                var tagFun= (attribs, children) => {
                    let node = '<';

                    // case 1. one argument, first may be attribs or content, but attribs if object.
                    if (typeof children === 'undefined') {
                        if (typeof attribs === 'object' &&
                            ! (attribs instanceof Array) &&
                            isAttribMap(attribs)) {
                            if (Object.keys(attribs).length === 0) {
                                node += name;
                            } else {
                                const tagAttribs = this.attribsToString(this.mergeAttribs(attribs, defaultAttribs));
                                node += [name, tagAttribs].filter(notEmpty).join(' ');
                            }
                            node += '>';
                        // case 2. arity 1, is undefined
                        } else if (typeof attribs === 'undefined') {
                            const tagAttribs = this.attribsToString(defaultAttribs);
                            node += [name, tagAttribs].filter(notEmpty).join(' ');
                            node += '>';
                        // case 3: arity 1, is content
                        } else if (isHtmlNode(attribs)) {
                            const tagAttribs = this.attribsToString(defaultAttribs);
                            node += [name, tagAttribs].filter(notEmpty).join(' ');
                            node += '>' + this.renderChildren(attribs);
                        }
                    // case 4. arity 2 - atribs + content
                    } else if (isAttribMap(attribs) && isHtmlNode(children)) {
                        if (Object.keys(attribs).length === 0) {
                            node += name;
                        } else {
                            const tagAttribs = this.attribsToString(this.mergeAttribs(attribs, defaultAttribs));
                            node += [name, tagAttribs].filter(notEmpty).join(' ');
                        }
                        node += '>' + this.renderChildren(children);
                    }
                    node += '</' + name + '>';
                    return node;
                };
                return tagFun;
            };
            return maker;
        }

    }

    return {Html};
});