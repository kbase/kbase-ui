define([
    'preact',
    'htm',
    'css!./Dashboard.css'
], (
    preact,
    htm
) => {

    const { h, Component } = preact;
    const html = htm.bind(h);

    class Dashboard extends Component {
        constructor(props) {
            super(props);
        }
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Dashboard | Developer Tools');
        }

        render() {
            return html`
                <div className="Dashboard">
                   <p>Dashboard</p>
                   <p>Live metrics</p>
                   <ul>
                       <li>Latency with kbase-ui container</li>
                       <li>Network performance with kbase-ui container</li>
                       <li>Latency and performance for services (status called)</li>
                       <li>Reported errors</li>
                       <li>Latency and performance for kbase-ui service</li>
                   </ul>
                </div>
            `;
        }
    }

    return Dashboard;
});