define([
    'preact'
], (
    preact
) => {

    const {Component} = preact;

    class Dashboard extends Component {
        componentDidMount() {
            if (this.props.runtime.service('session').isAuthenticated()) {
                this.props.runtime.send('ui', 'setTitle', 'Redirecting to Narratives...');
            }
        }
        render() {
            if (this.props.runtime.service('session').isAuthenticated()) {
                window.location.replace(window.location.origin + '/narratives');
            } else {
                window.location.replace(`${window.location.origin}#login`);
            }
        }
    }

    return Dashboard;
});
