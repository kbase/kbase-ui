define([
    'preact',
    'htm',
    'reactComponents/BootstrapPanel',
    'reactComponents/PresentableJSON',
    './ErrorView.styles',

    'bootstrap',
], (
    preact,
    htm,
    Panel,
    PresentableJSON,
    styles
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class ErrorView extends Component {
        renderInfo() {
            if (!this.props.info) {
                return;
            }
            return html`
                <div style=${styles.Title}>Additional Info</div>
                <${PresentableJSON} data=${this.props.info} tableStyle="" />
            `;
        }
        renderRemedies() {
            if (!this.props.remedies) {
                return ;
            }
            const remedies = this.props.remedies.map((remedy) => {
                if ('url' in remedy) {
                    return html`
                        <li><a href=${remedy.url} target="_blank" title=${remedy.tooltip}>${remedy.title}</a></li>
                    `;
                } else {
                    return html`
                        <li><span title=${remedy.tooltip}>${remedy.title}</span></li>
                    `;
                }
            });
            return html`
                <div style=${styles.Title}>Remedies</div>
                <ul>
                    ${remedies}
                </ul>
            `;
        }
        renderBody() {
            if (this.props.render) {
                return this.props.render();
            }
            if (!this.props.message) {
                return this.props.children;
            }
            return html`
                
                <div style=${styles.Description}>${this.props.description}</div>
                <div style=${styles.Message}>${this.props.message}</div>
                ${this.renderRemedies()}
                ${this.renderInfo()}
            `;
        }
        render() {
            return html`
                <${Panel} title=${this.props.title} type="danger">
                    ${this.renderBody()}
                </>
            `;
        }
    }

    return ErrorView;
});