define([
    'preact',
    'htm',

    'bootstrap'
], (
    preact,
    htm
) => {

    const {h, Component } = preact;
    const html = htm.bind(h);

    class ErrorAlert extends Component {
        render() {
            const content = (() => {
                if (this.props.render) {
                    return this.props.render();
                }
                return this.props.message || this.props.children;
            })();
            return html`
                <div className="alert alert-danger" style=${{width:'50%', margin: '0 auto'}}>
                    ${content}
                </div>
            `;
        }
    }

    return ErrorAlert;
});