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

    class Loading extends Component {
        render() {
            return html`
                <div>
                    <span className="fa fa-2x fa-spinner fa-pulse"></span>
                    ${' '}
                    ${this.props.message}
                </div>
            `;
        }
    }

    return Loading;
});