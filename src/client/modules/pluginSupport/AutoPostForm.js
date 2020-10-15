define([
    'preact',
    'htm',
    'uuid'
], (
    preact,
    htm,
    Uuid
) => {

    const {h, Component, createRef} = preact;
    const html = htm.bind(h);

    class AutoPostForm extends Component {
        constructor(props) {
            super(props);
            this.ref = createRef();
        }
        componentDidMount() {
            // Should never occur, throw error?
            if (this.ref.current === null) {
                return;
            }
            this.ref.current.submit();
        }
        render() {
            const {params, action} = this.props;
            const id = new Uuid(4).format();
            const formID = `html_${id}`;

            const paramInputs = Array.from(Object.entries(params))
                .map(([name, value]) => {
                    return html`<input
                        type="hidden"
                        key=${name}
                        name=${name}
                        value=${value} />
                    `;
                });

            return html`
            <form method="post"
                  ref=${this.ref}
                  id=${formID}
                  action=${action}
                  style=${{display: 'hidden'}}
                  >
                ${paramInputs}
            </form>
            `;
        }
    }

    return AutoPostForm;
});