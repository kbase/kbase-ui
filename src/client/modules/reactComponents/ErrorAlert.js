define([
    'preact',
    'htm',

    'bootstrap',
], (
    preact,
    htm,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class ErrorAlert extends Component {
        renderContent() {
            if (this.props.render) {
                return this.props.render();
            }
            return this.props.message || this.props.children;
        }

        renderTitle() {
            return html`<h4 className="alert-heading">${this.props.title || 'Error'}</h4>`;
        }
        render() {
            return html`
                <div className="alert alert-danger" style=${{width: '50%', margin: '0 auto'}}>
                    ${this.renderTitle()}
                    ${this.renderContent()}
                </div>
            `;
        }
    }

    return ErrorAlert;
});