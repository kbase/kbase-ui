define([
    'preact',
    'htm',
    '../reactComponents/Main',
    '../reactComponents/ConfigEditor',
    'reactComponents/Tabs',
    'css!./Developer',
], (
    preact,
    htm,
    Main,
    ConfigEditor,
    Tabs,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class Developer extends Component {
        constructor(props) {
            super(props);
        }

        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Developer Tools ;)');
        }

        renderTabs() {
            const tabs = [{
                id: 'main',
                title: 'Main',
                component: Main,
            }, {
                id: 'config',
                title: 'Config Editor',
                component: ConfigEditor,
            }];
            const tabProps = {
                runtime: this.props.runtime,
            };
            return html`
                <${Tabs} tabs=${tabs} tabProps=${tabProps}/>
            `;
        }

        render() {
            return html`
                <div className="Developer"
                     data-k-b-testhook-plugin="developer">
                    ${this.renderTabs()}
                </div>
            `;
        }
    }

    return Developer;
});