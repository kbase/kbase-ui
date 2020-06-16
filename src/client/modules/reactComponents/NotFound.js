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

    class NotFound extends Component {
        render() {
            return html`
                <div className="alert alert-danger">
                <p>Path not found</p>
                <p>${this.props.path}</p>
                </div>
            `;
        }
    }

    return NotFound;
});