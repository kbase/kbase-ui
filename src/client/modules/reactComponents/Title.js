define([
    'preact',
    'htm',
    "dompurify",
    "lib/utils",

    // For effect
    'css!./Title.css'
], (
    preact,
    htm,
    DOMPurify,
    {domSafeText}
) => {

    const {h, Component } = preact;
    const html = htm.bind(h);

    class Title extends Component {
        constructor(props) {
            super(props);
            this.state = {
                title: this.props.title
            };
        }

        componentDidMount() {
            // Listen for a setTitle message sent to the ui.
            // We use the widget convenience function in order to
            // get automatic event listener cleanup. We could almost
            // as easily do this ourselves.
            this.props.runtime.receive('ui', 'setTitle', (newTitle) => {
                if (typeof newTitle !== 'string') {
                    return;
                }

                if (newTitle && newTitle.trim().length > 0) {
                    document.title = `${domSafeText(newTitle)} | KBase`
                } else {
                    document.title = 'KBase'
                }

                this.setState({
                    title: newTitle
                });
            });
        }

        render() {
            // Note that this allows html to be set in the title. This allows plugins to set
            // html.
            return html`
                <h1 className="Title"
                     role="heading" 
                     aria-level="1"
                     dangerouslySetInnerHTML=${{ __html: DOMPurify.sanitize(this.state.title) }}>
                </h1>
            `;
        }
    }

    return Title;
});
