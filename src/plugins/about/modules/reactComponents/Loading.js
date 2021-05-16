define([
    'preact',
    'htm',
    './Loading.styles',
    'bootstrap'
], (
    preact,
    htm,
    styles
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class Loading extends Component {
        render() {
            return html`
                <div style=${styles.LoadingContainer}>
                    <div style=${styles.Loading}>
                        <span className="fa fa-2x fa-spinner fa-pulse"></span>
                        ${' '}
                        <span style=${styles.LoadingMessage}>
                            ${this.props.message}
                        </span>
                    </div>
                </div>
            `;
        }
    }

    return Loading;
});