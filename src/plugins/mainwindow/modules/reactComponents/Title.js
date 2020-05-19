define([
    'preact',
    'htm',
    'css!./Title.css'
], (
    preact,
    htm
) => {
    'use strict';

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
            return html`
                <div className="Title"
                     data-k-b-testhook-component="title">
                    ${this.state.title}
                </div>
            `;
        }
    }

    return Title;
});