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
    'use strict';

    const { h, Component } = preact;
    const html = htm.bind(h);

    class DeprecatedBulkUI extends Component {
        componentDidMount() {
            this.props.runtime.send('ui', 'setTitle', 'Bulk Import - DEPRECATED');
        }
        render() {
            const body = html`
                <div>
                    <p>This Bulk Import interface is no longer supported.</p>
                    <p>
                        To import data to your KBase account, please use the new Import tab, 
                        which you can find in the Data Slideout in any Narrative. See 
                        ${' '}
                        <a href="https://docs.kbase.us/getting-started/narrative/add-data" target="_blank">
                            https://docs.kbase.us/getting-started/narrative/add-data
                        </a>
                    </p>
                    <p>
                    The new Import tab also has a link to let you transfer data from your Globus 
                    account to your Narrative -- See 
                    <a href="https://docs.kbase.us/data/globus"
                    target="_blank">
                    https://docs.kbase.us/data/globus
                    </a> 
                    ${' '}
                    for more information
                    </p>
                </div>
            `;
            return html`
                <div className="container-fluid"
                    data-k-b-testhook-plugin="welcome">
                    <div className="row">
                        <div className="col-sm-8 col-sm-push-2">
                            <${BootstrapPanel} title="Bulk Import - DEPRECATED" type="warning" body=${body}   } />
                        </div>
                    </div>
                </div>
            `;
        }
    }

    return DeprecatedBulkUI;
});