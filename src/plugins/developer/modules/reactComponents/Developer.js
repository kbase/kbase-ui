define([
    'preact',
    'htm'
], (
    preact,
    htm
) => {
    'use strict';

    const { h, Component } = preact;
    const html = htm.bind(h);

    class DeprecatedBulkUI extends Component {
        constructor(props) {
            super(props);
        }
        render() {
            return html`
                <div>
                   Developer
                </div>
            `;
        }
    }

    return DeprecatedBulkUI;
});