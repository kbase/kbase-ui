type HtmlNode = null | string | number | HtmlNodeArray;

type HtmlNodeArray = Array<HtmlNode>;

// interface ITag {
//     (attribs?: AttribMap, children?: HtmlNode): string;
// }

// type Tag1 = (attribs: AttribMap, children: HtmlNode) => string;
// type Tag2 = (attribs: AttribMap) => string;
// type Tag3 = (children: HtmlNode) => string;

// type Tag = Tag1 | Tag2 | Tag3;

type Tag = (attribs: AttribMap | HtmlNode, children?: HtmlNode) => string;

// type AttribMap = {key:string, value: string | number | boolean}

interface StyleAttribMap {
    [key: string]: string;
}

interface AttribMap {
    [key: string]: string | StyleAttribMap;
}

export class HTML {
    renderChildren(children: HtmlNode): string {
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
            throw new Error(`hmm, not an array? ${typeof children}`);
        }
        return children
            .map((child) => {
                return this.renderChildren(child);
            })
            .join('');
    }

    styleAttribsToString(attribs: StyleAttribMap): string {
        return Object.keys(attribs)
            .map((key) => {
                const value = attribs[key];
                const attribValue = value;
                const attribName = key.replace(/[A-Z]/g, (m) => {
                    return `-${m.toLowerCase()}`;
                });
                return [attribName, attribValue].join(': ');
            })
            .join('; ');
    }

    attribsToString(attribs: AttribMap): string {
        return Object.keys(attribs)
            .map((key) => {
                const value = attribs[key];
                let attribValue;
                if (typeof value === 'string') {
                    attribValue = `"${value.replace(/"/, '""')}"`;
                } else {
                    attribValue = `"${this.styleAttribsToString(value)}"`;
                }
                const attribName = key.replace(/[A-Z]/g, (m) => {
                    return `-${m.toLowerCase()}`;
                });
                return [attribName, attribValue].join('=');
            })
            .join(' ');
    }

    mergeAttribs(
        a: AttribMap | undefined,
        b: AttribMap | undefined
    ): AttribMap {
        // ensure we can merge even if the base is not mergable...
        if (typeof a === 'undefined') {
            a = {};
        }
        const merger = (x: any, y: any) => {
            // 0. Only merge if y is an object, otherwise just skip it.
            if (typeof y === 'object' && y !== null) {
                Object.keys(y).forEach((key) => {
                    const xval = x[key];
                    const yval = y[key];
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
    tagMaker(): (name: string) => Tag {
        const isHtmlNode = (val: AttribMap | HtmlNode): val is HtmlNode => {
            return true;
        };
        const isAttribMap = (val: AttribMap | HtmlNode): val is AttribMap => {
            return true;
        };
        const notEmpty = (x: undefined | null | string) => {
            if (typeof x === 'undefined' || x === null || x.length === 0) {
                return false;
            }
            return true;
        };
        const maker: any = (
            name: string,
            defaultAttribs: AttribMap = <AttribMap>{}
        ) => {
            const tagFun: Tag = (
                attribs?: AttribMap | HtmlNode,
                children?: HtmlNode | undefined
            ): string => {
                let node = '<';

                // case 1. one argument, first may be attribs or content, but attribs if object.
                if (typeof children === 'undefined') {
                    if (
                        typeof attribs === 'object' &&
                        !(attribs instanceof Array) &&
                        isAttribMap(attribs)
                    ) {
                        if (Object.keys(attribs).length === 0) {
                            node += name;
                        } else {
                            const tagAttribs = this.attribsToString(
                                this.mergeAttribs(attribs, defaultAttribs)
                            );
                            node += [name, tagAttribs]
                                .filter(notEmpty)
                                .join(' ');
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
                        node += `>${this.renderChildren(attribs)}`;
                    }
                    // case 4. arity 2 - atribs + content
                } else if (
                    typeof attribs !== 'undefined' &&
                    isAttribMap(attribs) &&
                    isHtmlNode(children)
                ) {
                    if (Object.keys(attribs).length === 0) {
                        node += name;
                    } else {
                        const tagAttribs = this.attribsToString(
                            this.mergeAttribs(attribs, defaultAttribs)
                        );
                        node += [name, tagAttribs].filter(notEmpty).join(' ');
                    }
                    node += `>${this.renderChildren(children)}`;
                }
                node += `</${name}>`;
                return node;
            };
            return tagFun;
        };
        return maker;
    }

    // todo: figure out how to get ts packages in here...
    genIdSerial = 0;

    genId(): string {
        const random = Math.floor(Math.random() * 1000);
        const time = new Date().getTime();
        if (this.genIdSerial === 1000) {
            this.genIdSerial = 0;
        }
        this.genIdSerial += 1;
        return [random, time, this.genIdSerial].map(String).join('-');
    }
}
