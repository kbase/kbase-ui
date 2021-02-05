define([
    'preact',
    'htm',
    'css!./Plugins.css'
], (
    preact,
    htm
) => {

    const { h, Component } = preact;
    const html = htm.bind(h);

    class Plugins extends Component {
        constructor(props) {
            super(props);
        }
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Plugins | Developer Tools');
        }

        render() {
            return html`
                <div className="Plugins">
                   <p>Plugins Catalog</p>
                   <p>What  can you do here?</p>
                   <ul>
                       <li>View a searchable, sortable listing of plugins</li>
s                   </ul>
                </div>
            `;
        }
    }

    return Plugins;
});