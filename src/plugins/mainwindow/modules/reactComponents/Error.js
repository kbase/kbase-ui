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

    class Error extends Component {
        render() {
            return html`
                <div className="alert alert-danger">
                    ${this.props.message}
                </div>
            `;
        }
    }

    return Error;
});