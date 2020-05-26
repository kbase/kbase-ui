define([
    'preact',
    'htm',
    './AboutService/AboutServiceMain',

    'bootstrap'
], (
    preact,
    htm,
    AboutService
) => {
    'use strict';

    const {h, Component } = preact;
    const html = htm.bind(h);

    class AboutServices extends Component {

        constructor(props) {
            super(props);
        }
        render() {
            return this.props.services.map((service) => {
                return html`
                    <h3>${service.title}</h3>
                    <div>
                        <${AboutService} service=${service} runtime=${this.props.runtime} />
                    </div>
                `;
            });
        }
    }

    return AboutServices;
});