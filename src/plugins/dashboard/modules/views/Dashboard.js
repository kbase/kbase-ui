define([
    'preact',
    'htm',
    '../reactComponents/BootstrapPanel',

    // for effect
    'bootstrap'
], (
    preact,
    htm,
    BootstrapPanel
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class Dashboard extends Component {
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Dashboard');
        }
        render() {
            const body = html`
                <div>
                    <p>Fake Dashboard...</p>
                </div>
            `;
            return html`
                <div className="container-fluid"
                    style=${{width: '100%'}}
                    data-k-b-testhook-plugin="welcome">
                    <div className="row">
                        <div className="col-sm-8 col-sm-push-2">
                            <${BootstrapPanel} title="Dashboard" type="warning" body=${body}   } />
                        </div>
                    </div>
                </div>
            `;
        }
    }

    return Dashboard;
});
