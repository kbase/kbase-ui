define([
    'preact',
    'htm'
], (
    preact,
    htm
) => {

    const {h, Component } = preact;
    const html = htm.bind(h);

    function plural(amount, singular, plural) {
        if (amount === 1) {
            return singular;
        }
        return plural;
    }

    class SystemAlertToggle extends Component {
        constructor(props) {
            super(props);
        }

        componentDidMount() {
        }

        doToggle() {
            this.props.runtime.send('system-alert', 'toggle-banner');
        }

        renderAlertCount() {
            if (this.props.alerts && this.props.alerts.length > 0) {
                return html`
                    <span style=${{fontWeight: 'bold'}}>${this.props.alerts.length}</span>
                    ${' '}${plural(this.props.alerts.length, 'alert', 'alerts')}
                `;
            } else {
                return 'no alerts';
            }
        }

        renderPresentAlerts() {
            if (this.props.summary.present === 0) {
                return;
            }
            return html`
                <div style=${{textAlign: 'center', cursor: 'pointer'}}>
                    <span class="fa fa-exclamation-triangle fa-color-danger"></span>
                </div>
            `;
        }

        renderFutureAlerts() {
            if (this.props.summary.future === 0) {
                return;
            }
            return html`
                <div style=${{textAlign: 'center', cursor: 'pointer'}}>
                    <span class="fa fa-clock-o fa-color-warning"></span>
                </div>
            `;
        }

        doClose() {
            this.props.runtime.send('system-alert', 'close-banner');
        }

        renderSummary() {
            if (!this.props.alerts || this.props.alerts.length === 0) {
                return html`
                    <div style=${{textAlign: 'center', cursor: 'pointer'}}
                         onClick=${this.doClose.bind(this)}>
                        <span class="fa fa-2x fa-thumbs-up fa-color-success"></span>
                    </div>
                `;
            }

            if (!this.props.summary) {
                return;
            }
            return html`

                ${this.renderPresentAlerts()}
                ${this.renderFutureAlerts()}
            `;
        }

        renderButton() {
            //
            return html`
                <div class=".-button"
                     onClick=${this.doToggle.bind(this)}>
                    <div style=${{textAlign: 'center', whiteSpace: 'nowrap'}}>
                        ${this.renderAlertCount()}
                        ${this.renderSummary()}
                    </div>
                </div>
            `;
        }

        render() {
            // // We only show the toggle when
            // if (!this.props.hideAlerts) {
            //     return;
            // }
            return html`
                <div className="SystemAlertToggle"
                     data-k-b-testhook-component="systemalerttoggle">
                     ${this.renderButton()}
                </div>
            `;
        }
    }

    return SystemAlertToggle;
});