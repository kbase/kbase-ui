define([
    'preact',
    'htm',

    'bootstrap',
], (
    preact,
    htm,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class PresentableJSON extends Component {
        tableClass() {
            const classes = ['table'];
            switch (this.props.tableStyle) {
            case 'striped':
                classes.push('table-striped');
            }
            return classes.join(' ');
        }

        renderArray(data) {
            const rows = data.map((datum, index) => {
                return html`
                    <tr>
                        <th style=${{color: 'rgba(150, 150, 150, 1)'}}>${index}</th>
                        <td><span className="fa fa-arrow-right" /></td>
                        <td>${this.renderJSON(datum)}</td>
                    </tr>
                `;
            });

            return html`
                <table className=${this.tableClass()}>
                    <tbody>
                    ${rows}
                    </tbody>
                </table>
            `;
        }

        renderObject(data) {
            return (() => {
                const rows = Object.keys(data).map((key) => {
                    return html`
                        <tr>
                            <th style=${{color: 'rgba(150, 150, 150, 1)'}}>${key}</th>
                            <td><span className="fa fa-arrow-right" /></td>
                            <td>${this.renderJSON(data[key])}</td>
                        </tr>
                    `;
                });
                return html`
                    <table className=${this.tableClass()}>
                        <tbody>
                        ${rows}
                        </tbody>
                    </table>
                `;
            })();
        }

        renderJSON(data) {
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

    return PresentableJSON;
});