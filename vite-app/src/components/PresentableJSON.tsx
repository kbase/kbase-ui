import { JSONArray, JSONObject, JSONValue } from '@kbase/ui-lib/lib/json';
import { Component } from 'react';

export interface PresentableJSONProps {
    tableStyle?: string;
    data: JSONValue;
}

export default class PresentableJSON extends Component<PresentableJSONProps> {
    tableClass() {
        const classes = ['table'];
        switch (this.props.tableStyle) {
            case 'striped':
                classes.push('table-striped');
        }
        return classes.join(' ');
    }

    renderArray(data: JSONArray) {
        const rows = data.map((datum, index) => {
            return <tr key={index}>
                <th style={{ color: 'rgba(150, 150, 150, 1)' }}>{index}</th>
                <td><span className="fa fa-arrow-right" /></td>
                <td>{this.renderJSON(datum)}</td>
            </tr>
        });

        return <table className={this.tableClass()}>
            <tbody>
                {rows}
            </tbody>
        </table>
    }

    renderObject(data: JSONObject) {
        return (() => {
            const rows = Object.keys(data).map((key, index) => {
                return <tr key={index}>
                    <th style={{ color: 'rgba(150, 150, 150, 1)' }}>{key}</th>
                    <td><span className="fa fa-arrow-right" /></td>
                    <td>{this.renderJSON(data[key])}</td>
                </tr>
            });
            return <table className={this.tableClass()}>
                <tbody>
                    {rows}
                </tbody>
            </table>
        })();
    }

    renderJSON(data: JSONValue) {
        switch (typeof data) {
            case 'string':
                return data;
            case 'number':
                return String(data);
            case 'boolean':
                return String(data);
            case 'object':
                if (data === null) {
                    return 'NULL';
                }
                if (data instanceof Array) {
                    return this.renderArray(data);
                } else {
                    return this.renderObject(data);
                }
            default:
                return 'Not representable: ' + (typeof data);
        }
    }

    render() {
        return this.renderJSON(this.props.data);
    }
}
