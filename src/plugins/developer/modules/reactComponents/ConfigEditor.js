define([
    'preact',
    'htm',
    'css!./ConfigEditor.css'
], (
    preact,
    htm
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class ConfigEditor extends Component {
        constructor(props) {
            super(props);
        }
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Config Editor');
        }
        onSave() {

        }
        isSimpleObject(value) {
            const simpleObject = {};
            if (value.constructor === simpleObject.constructor) {
                return true;
            }
            return false;
        }
        renderJSONString(value, path) {
            return html`
                <div>
                    <div>
                        <input 
                            value="${value}" 
                            className="form-control"
                            onInput=${(ev) => {
        this.props.runtime.setConfig(path, ev.target.value);
    }}
                             />
                    </div>
                </div>
                <div className="path">
                    ${path.join('.')}
                </div>
            `;
        }
        renderJSONNumber(value, path) {
            return html`
                <div>
                    <div><input value="${value}" className="form-control" /></div>
                    <div className="path">${path.join('.')}</div>
                </div>
            `;
        }
        renderJSONBoolean(value, path) {
            return html`
                <div>
                    <div>
                        <select className="form-control">
                            <option value="true" selected=${value ? 'selected' : '' }>true</option>
                            <option value="false" selected=${value ? '' : 'selected' }>false</option>
                        </select>
                    </div>
                    <div className="path">${path.join('.')}</div>
                </div>
            `;
        }
        renderJSONNull(value, path) {
            return html`
                <div>
                    <div><input value="" className="form-control" /></div>
                    <div className="path">${path.join('.')}</div>
                </div>
            `;
        }
        renderJSONArray(values, path) {
            const rows = values.map((value, index) => {
                const nextPath = [...path, index];
                return html`
                    <tr>
                        <td>
                            ${this.renderJSONValue(value, nextPath)}
                        </td>
                    </tr>
                `;
            });
            return html`
                <table>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            `;
        }
        renderJSONObject(values, path) {
            const rows = Object.entries(values).map(([key, value]) => {
                const nextPath = [...path, key];
                return html`
                    <tr>
                        <th>
                            ${key}
                        </th>
                        <td>
                            ${this.renderJSONValue(value, nextPath)}
                        </td>
                    </tr>
                `;
            });
            return html`
                <table className="table">
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            `;
        }
        renderJSONValue(value, path) {
            switch (typeof value) {
            case 'string': return this.renderJSONString(value, path);
            case 'number': return this.renderJSONNumber(value, path);
            case 'boolean': return this.renderJSONBoolean(value, path);
            case 'object':
                if (Array.isArray(value)) {
                    return this.renderJSONArray(value, path);
                } else if (value === null) {
                    return this.renderJSONNull(value, path);
                } else if (this.isSimpleObject(value)) {
                    return this.renderJSONObject(value, path);
                } else {
                    throw new Error('Not a json value');
                }
            }
        }
        renderEditor() {
            return this.renderJSONValue(this.props.runtime.rawConfig(), []);
        }
        render() {
            return html`
                <div>
                   <div>
                        ${this.renderEditor()}
                   </div>
                </div>
            `;
        }
    }

    return ConfigEditor;
});