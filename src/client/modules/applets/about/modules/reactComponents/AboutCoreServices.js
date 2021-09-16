define([
    'preact',
    'htm',
    './AboutService/AboutServiceMain',

    'bootstrap'
], (
    preact,
    htm,
    AboutService
) => {

    const { h, Component } = preact;
    const html = htm.bind(h);

    const SERVICES = [
        {
            title: 'Auth',
            type: 'rest',
            module: 'auth2',
            path: '/',
            versionKey: 'version'
        },
        {
            title: 'Catalog',
            module: 'Catalog',
            type: 'jsonrpc11',
            versionMethod: 'version'
        },
        {
            title: 'Execution Engine 2',
            type: 'jsonrpc11',
            module: 'execution_engine2',
            versionMethod: 'ver'
        },
        {
            title: 'Feeds',
            type: 'rest',
            module: 'feeds',
            path: '/',
            versionKey: 'version'
        },
        {
            title: 'Groups',
            type: 'rest',
            module: 'groups',
            path: '/',
            versionKey: 'version'
        },
        {
            title: 'Samples',
            module: 'SampleService',
            type: 'jsonrpc11',
            statusMethod: 'status',
            versionKey: 'version'
        },
        {
            title: 'Search2',
            module: 'SearchAPI2',
            type: 'jsonrpc20',
            statusMethod: 'rpc.discover',
            versionKey: 'service_info.version'
            // statusKeys: [
            //     {
            //         key: 'version',
            //         label: 'Version'
            //     },
            //     {
            //         key: 'average',
            //         label: ''
            //     }
            // ]
        },
        {
            title: 'Service Wizard',
            module: 'ServiceWizard',
            type: 'jsonrpc11',
            versionMethod: 'version'
        },
        {
            title: 'User Profile',
            module: 'UserProfile',
            type: 'jsonrpc11',
            versionMethod: 'ver'
        },
        {
            title: 'Workspace',
            module: 'Workspace',
            type: 'jsonrpc11',
            versionMethod: 'ver'
        },
    ];

    class AboutCoreServices extends Component {
        render() {
            const rows = SERVICES.map((service) => {
                return html`
                    <tr>
                        <td>
                            ${service.title}
                        </td>
                        <${AboutService} service=${service} runtime=${this.props.runtime}/>
                    </tr>
                `;
            });
            return html`
                <table class="table table-striped">
                    <thead>
                    <tr>

                        <th style=${{ width: '12em' }}>
                            Service
                        </th>
                        <th>
                            Version
                        </th>
                        <th>
                            Perf (ms/call)
                        </th>
                        <th>
                            Perf calls (ms/call)
                        </th>

                    </tr>
                    </thead>
                    <tbody>
                    ${rows}
                    </tbody>

                </table>
            `;
        }
    }

    return AboutCoreServices;
});