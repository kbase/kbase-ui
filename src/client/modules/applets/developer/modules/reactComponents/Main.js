define([
    'preact',
    'htm',
    'css!./Main.css',
], (
    preact,
    htm,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class Main extends Component {
        constructor(props) {
            super(props);
        }

        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Developer Tools - Main');
        }

        render() {
            return html`
                <div className="Main">
                    <p>Welcome to the Developer Tools.</p>
                    <p>Currently this tool just lets you edit the runtime config.</p>
                </div>
            `;
        }
    }

    return Main;
});