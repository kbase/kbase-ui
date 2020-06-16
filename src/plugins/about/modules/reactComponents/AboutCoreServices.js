define([
    'preact',
    'htm',
    './AboutService/AboutServiceMain'
], (
    preact,
    htm,
    AboutService
) => {
    'use strict';

    const {h, Component } = preact;
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
            title: 'Search (legacy)',
            module: 'KBaseSearchEngine',
            type: 'jsonrpc11',
            statusMethod: 'status',
            versionKey: 'version'
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
            return SERVICES.map((service) => {
                return html`
                    <h3>${service.title}</h3>
                    <div>
                        <${AboutService} service=${service} runtime=${this.props.runtime} />
                    </div>
                `;
            });
        }
    }

    return AboutCoreServices;
});