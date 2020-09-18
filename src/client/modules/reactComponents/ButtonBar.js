define([
    'preact',
    'htm'
], (
    preact,
    htm
) => {

    const {h, Component } = preact;
    const html = htm.bind(h);

    class ButtonBar extends Component {
        constructor(props) {
            super(props);
        }

        componentDidUpdate() {
        }

        render() {
            return html`
                <div className="ButtonBar"
                     data-k-b-testhook-component="buttonbar">
                </div>
            `;
        }
    }

    return ButtonBar;
});