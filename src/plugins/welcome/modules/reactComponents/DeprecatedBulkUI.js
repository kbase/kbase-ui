define([
    'preact',
    'htm',
    './BootstrapPanel',

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
        constructor(props) {
            super(props);
        }
        render() {
            const body = html`
                <div>
                    <p>This Bulk Import interface is no longer supported.</p>
                    <p>
                        To import data to your KBase account, please use the new Import tab, 
                        which you can find in the Data Slideout in any Narrative. See 
                        ${' '}
                        <a href="http://kbase.us/narrative-guide/add-data-to-your-narrative-2" target="_blank">
                            http://kbase.us/narrative-guide/add-data-to-your-narrative-2
                        </a>
                    </p>
                    <p>
                    The new Import tab also has a link to let you transfer data from your Globus 
                    account to your Narrative -- See 
                    <a href="http://kbase.us/transfer-data-from-globus-to-kbase"
                    target="_blank">
                    http://kbase.us/transfer-data-from-globus-to-kbase
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