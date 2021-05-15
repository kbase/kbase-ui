define([
    'preact',
    'htm',

    'bootstrap',
], (
    preact,
    htm,
) => {

    const {h, Component} = preact;
    const html = htm.bind(h);

    class AboutService extends Component {
        render() {
            return html`
                <td>${this.props.version}</td>
                <td>
                    <div style=${{textAlign: 'right', width: '6em'}}>
                        ${Intl.NumberFormat('en-US', {
        useGrouping: true,
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(this.props.average)}
                    </div>
                </td>
                <td>${this.props.measures.join(', ')}</td>
            `;
        }
    }

    return AboutService;
});
