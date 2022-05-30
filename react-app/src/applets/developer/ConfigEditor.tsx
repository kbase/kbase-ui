import {
    isJSONArray,
    isJSONObject,
    JSONArray,
    JSONObject,
    JSONValue,
} from '../../lib/json';
import { Component } from 'react';
import { Config } from '../../types/config';
import './ConfigEditor.css';

type Path = Array<string | number>;

export interface ConfigEditorProps {
    setTitle: (title: string) => void;
    config: Config;
}

interface ConfigEditorState {}

export default class ConfigEditor extends Component<
    ConfigEditorProps,
    ConfigEditorState
> {
    componentDidMount() {
        this.props.setTitle('Config Editor');
    }
    renderJSONString(value: string, path: Path) {
        return (
            <div>
                <div>
                    <div>
                        <input
                            value={value}
                            className="form-control"
                            onInput={(ev) => {
                                // TODO: create setConfig runtime function
                                // this.props.runtime.setConfig(path, ev.target.value);
                            }}
                        />
                    </div>
                </div>
                <div className="path">{path.join('.')}</div>
            </div>
        );
    }
    renderJSONNumber(value: number, path: Path) {
        return (
            <div>
                <div>
                    <input value={value} className="form-control" />
                </div>
                <div className="path">{path.join('.')}</div>
            </div>
        );
    }
    renderJSONBoolean(value: boolean, path: Path) {
        return (
            <div>
                <div>
                    <select className="form-control">
                        <option value="true" selected={value}>
                            true
                        </option>
                        <option value="false" selected={!value}>
                            false
                        </option>
                    </select>
                </div>
                <div className="path">{path.join('.')}</div>
            </div>
        );
    }
    renderJSONNull(value: null, path: Path) {
        return (
            <div>
                <div>
                    <input value="" className="form-control" />
                </div>
                <div className="path">{path.join('.')}</div>
            </div>
        );
    }
    renderJSONArray(value: JSONArray, path: Path) {
        const rows = value.map((arrayValue, index) => {
            const nextPath = [...path, index];
            return (
                <tr key={index}>
                    <td>{this.renderJSONValue(arrayValue, nextPath)}</td>
                </tr>
            );
        });
        return (
            <table>
                <tbody>{rows}</tbody>
            </table>
        );
    }
    renderJSONObject(value: JSONObject, path: Path) {
        const rows = Object.entries(value).map(([key, propertyValue]) => {
            const nextPath = [...path, key];
            return (
                <tr key={key}>
                    <th>{key}</th>
                    <td>{this.renderJSONValue(propertyValue, nextPath)}</td>
                </tr>
            );
        });
        return (
            <table className="table">
                <tbody>{rows}</tbody>
            </table>
        );
    }
    renderJSONValue(value: JSONValue, path: Path): JSX.Element {
        switch (typeof value) {
            case 'string':
                return this.renderJSONString(value, path);
            case 'number':
                return this.renderJSONNumber(value, path);
            case 'boolean':
                return this.renderJSONBoolean(value, path);
            case 'object':
                if (isJSONArray(value)) {
                    return this.renderJSONArray(value, path);
                } else if (value === null) {
                    return this.renderJSONNull(value, path);
                } else if (isJSONObject(value)) {
                    return this.renderJSONObject(value, path);
                } else {
                    throw new Error('Not a json value');
                }
        }
    }
    renderEditor(): JSX.Element {
        // assert config is json compatible.
        // TODO: do this for real; either the type is built that way, or
        // we pass it through a type-test-and-assert function.
        const config = this.props.config as unknown as JSONObject;
        return this.renderJSONValue(config, []);
    }
    render() {
        return (
            <div className="ConfigEditor">
                <div>{this.renderEditor()}</div>
            </div>
        );
    }
}
