define([
    'preact',
    'htm',

    'bootstrap',
    'css!./ErrorAlert'
], (
    preact,
    htm
) => {

    const { h, Component } = preact;
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
                <div className="ErrorAlert alert alert-danger">
                    <p className="ErrorAlert-title">
                        <span className="fa fa-exclamation-circle"></span>
                        ${this.props.title || 'Error'}
                    </p>
                    ${content}
                </div>
            `;
        }
    }

    return ErrorAlert;
});