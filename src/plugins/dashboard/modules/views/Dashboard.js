define([
    'preact'
], (
    preact
) => {

    const {h, Component} = preact;

    class Dashboard extends Component {
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Redirecting to Narratives...');
        }
        render() {
            window.location.replace(window.location.origin + '/narratives');
        }
    }

    return Dashboard;
});
