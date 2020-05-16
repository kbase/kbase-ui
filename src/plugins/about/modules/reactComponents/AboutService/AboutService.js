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

    class AboutService extends Component {
        render() {
            return html`
                <table className="table">
                    <tbody>
                        <tr >
                            <th style=${{width: '12em'}}>Version</th>
                            <td>${this.props.version}</td>
                        </tr>
                        <tr>
                            <th>Perf avg (ms/call)</th>
                            <td>${this.props.average}</td>
                        </tr>
                        <tr>
                            <th>Perf calls (ms/call)</th>
                            <td>${this.props.measures.join(', ')}</td>
                        </tr>
                    </tbody>
                </table>
            `;

        }

    }

    return AboutService;
});
