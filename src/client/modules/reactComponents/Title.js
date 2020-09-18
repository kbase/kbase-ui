define([
    'preact',
    'htm',
    'css!./Title.css'
], (
    preact,
    htm
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

                this.setState({
                    title: newTitle
                });
            });
        }

        render() {
            // Note that this allows html to be set in the title. This allows plugins to set
            // html.
            return html`
                <div className="Title"
                     data-k-b-testhook-component="title">
                     <span dangerouslySetInnerHTML=${{ __html: this.state.title }}></span>
                </div>
            `;
        }
    }

    return Title;
});