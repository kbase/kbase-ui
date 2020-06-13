define([
    'preact',
    'htm'
], (
    preact,
    htm
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class Deployment extends Component {
        constructor(props) {
            super(props);
            this.label = this.props.runtime.config('deploy.environment').toUpperCase();
            this.icon = this.props.runtime.config('deploy.icon');
            this.environment = this.props.runtime.config('deploy.environment');
        }

        componentDidUpdate() {
        }

        render() {
            if (this.environment === 'prod') {
                return;
            }
            return html`
                <div className="Deployment"
                     data-k-b-testhook-component="deployment"
                     style=${{
        border: '1px silver solid',
        padding: '3px',
        margin: '2px'
    }}>
                    <div style=${{
        textAlign: 'center',
        fontWeight: 'bold',
    }}>
                        ${this.label}
                    </div>
                    <div style=${{
        textAlign: 'center'
    }}>
                        <span className=${'fa fa-2x fa-' + this.icon}></span>
                    </div>
                </div>
            `;
        }
    }

    return Deployment;
});