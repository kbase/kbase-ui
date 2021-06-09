define([
    'preact',
    'htm',

    'bootstrap',
    'css!./Loading',
], (
    preact,
    htm,
) => {
    const {h, Component} = preact;
    const html = htm.bind(h);

    const SLOW_TIME = 3000;
    const VERY_SLOW_TIME = 10000;

    class Loading extends Component {
        constructor(props) {
            super(props);
            this.state = {
                status: 'started',
            };
        }

        componentDidMount() {
            if (this.props.detectSlow) {
                this.startWatchingSlow();
            }
        }

        componentWillUnmount() {
            this.stopWatching();
        }

        startWatchingSlow() {
            this.watchListener = window.setTimeout(() => {
                this.setState({
                    status: 'slow',
                });
                this.startWatchingVerySlow();
            }, SLOW_TIME);
        }

        startWatchingVerySlow() {
            this.watchListener = window.setTimeout(() => {
                this.setState({
                    status: 'veryslow',
                });
                this.startWatchingVerySlow();
            }, VERY_SLOW_TIME);
        }

        stopWatching() {
            if (this.watchListener) {
                window.clearTimeout(this.watchListener);
            }
        }

        renderLoadingMessage() {
            return html`
                <div className="Loading-message">
                    <span className="fa fa-2x fa-spinner fa-pulse"></span>
                ${' '}
                    ${this.props.message}
                </div>
            `;
        }

        render() {
            const message = (() => {
                switch (this.state.status) {
                case 'started':
                    return this.renderLoadingMessage();
                case 'slow':
                    return html`
                        <div>
                            ${this.renderLoadingMessage()}
                            <p className="text text-warning" style=${{marginTop: '1em'}}>
                                <span className="fa fa-exclamation-triangle"></span>
                                This process is taking longer than expected. Still trying...
                            </p>
                        </div>
                    `;
                case 'veryslow':
                    return html`
                        <div>
                            ${this.renderLoadingMessage()}
                            <p className="text text-danger" style=${{marginTop: '1em'}}>
                                <span className="fa fa-exclamation-triangle"></span>
                                This process is taking <b>much</b> longer than expected. Still trying...
                            </p>
                        </div>
                    `;
                }
            })();
            return html`
                <div className="well" style=${{width: '50%', margin: '0 auto'}}>
                    ${message}
                </div>
            `;
        }
    }

    return Loading;
});