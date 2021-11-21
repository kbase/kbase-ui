import { Component } from 'react';
import { Table } from 'react-bootstrap';
import { JSONArray, JSONObject, JSONValue } from '../lib/json';

export interface RenderJSONProps {
    value: JSONValue;
}

export default class RenderJSON extends Component<RenderJSONProps> {
    renderJSONArray(data: JSONArray) {
        const rows = data.map((value, index) => {
            return (
                <tr>
                    <th className="RenderJSON-headerCell">{String(index)}</th>
                    <td>{this.renderJSON(value)}</td>
                </tr>
            );
        });
        return (
            <Table size="sm">
                <tbody>{rows}</tbody>
            </Table>
        );
    }

    /**
     * Renders a table containing the key-value pairs of a JSON-compatible object. The table's first column
     * contains the key, the second the value. The value is rendered with `$renderJSON`, so it is essentially
     * recursive (in that it may call `$renderJSONObject` in turn.)
     *
     * @param {Object} data - An simple object ({}.constructor) whose properties are JSON-compatible values
     * @returns {jQuery} A jQuery object representing a table of an object's key-value pairs, in
     * which the first column is the key and the second the value.
     */
    renderJSONObject(data: JSONObject) {
        const rows = Object.entries(data).map(([key, value]) => {
            return (
                <tr>
                    <th className="RenderJSON-headerCell">{key}</th>
                    <td>{this.renderJSON(value)}</td>
                </tr>
            );
        });
        return (
            <Table size="sm">
                <tbody>{rows}</tbody>
            </Table>
        );
    }

    renderJSONString(data: string) {
        return <div>{data}</div>;
    }

    renderJSONNumber(data: number) {
        return <div>{String(data)}</div>;
    }

    renderJSONBoolean(data: boolean) {
        return <div>{String(data)}</div>;
    }

    renderJSONNull() {
        return <div>null</div>;
    }

    /**
     * Fully renders a JSON-compatible value. Since a value may be an array or object, which are recursively
     * rendered using functions in this module, the final render may be a nested set of json values.
     *
     * @param {JSONValue} data - A JSON-compatible value to render
     * @returns {jQuery} A jQuery object representing the rendering of the entire JSON value, which may
     * be nested renderings of arrays and objects of JSON values.
     */
    renderJSON(data: JSONValue) {
        switch (typeof data) {
            case 'string':
                return this.renderJSONString(data);
            case 'number':
                return this.renderJSONNumber(data);
            case 'boolean':
                return this.renderJSONBoolean(data);
            case 'object':
                if (data === null) {
                    return this.renderJSONNull();
                }
                if (data instanceof Array) {
                    return this.renderJSONArray(data);
                } else {
                    // We accept all other types of objects here; note that this may fail
                    // for non-plain objects
                    return this.renderJSONObject(data);
                }
            case 'undefined':
                // ignore
                return '';
            default:
                return this.renderJSONString(
                    `not representable: "${typeof data}"`
                );
        }
    }

    render() {
        return this.renderJSON(this.props.value);
    }
}
