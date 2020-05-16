define([
    'preact',
    'htm',

    'bootstrap'
], (
    preact,
    htm
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class PresentableJSON extends Component {
        renderPresentableJSON(data) {
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
                    return (() => {
                        const rows = data.map((datum, index) => {
                            return html`
                                <tr>
                                    <th>${index}</th>
                                    <td>${this.renderPresentableJSON(datum)}</td>
                                </tr>
                            `;
                        });
                        return html`
                            <table className="table table-striped">
                                <tbody>
                                ${rows}
                                </tbody>
                            </table>
                        `;
                    })();
                }
                return (() => {
                    const rows = Object.keys(data).map((key) => {
                        return html`
                            <tr>
                                <th>${key}</th>
                                <td>${this.renderPresentableJSON(data[key])}</td>
                            </tr>
                        `;
                    });
                    return html`
                        <table className="table table-striped">
                            <tbody>
                            ${rows}
                            </tbody>
                        </table>
                    `;
                })();
            default:
                return 'Not representable: ' + (typeof data);
            }
        }

        render() {
            return this.renderPresentableJSON(this.props.data);
        }
    }

    return PresentableJSON;
});