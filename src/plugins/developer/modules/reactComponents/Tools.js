define([
    'preact',
    'htm',
    'css!./Tools.css'
], (
    preact,
    htm
) => {

    const { h, Component } = preact;
    const html = htm.bind(h);

    class Tools extends Component {
        constructor(props) {
            super(props);
        }
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Tools | Developer Tools');
        }

        render() {
            return html`
                <div className="Tools">
                   <p>Tools</p>
                   <p>What  can you do here?</p>
                   <ul>
                       <li>Get your current token</li>
                       <li>Spy on messages</li>
                       <li>...</li>
                   </ul>
                </div>
            `;
        }
    }

    return Tools;
});