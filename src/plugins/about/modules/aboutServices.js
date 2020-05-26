define([
    'preact',
    'htm',
    './reactComponents/AboutServices',
    './reactComponents/AboutDynamicServices',

    'bootstrap'],
function (
    preact,
    htm,
    AboutServicesComponent,
    AboutDynamicServices
) {
    'use strict';

    const {h, render} = preact;
    const html = htm.bind(h);

    class AboutServices {
        constructor({ runtime }) {
            this.runtime = runtime;
            this.mount = null;
            this.container = null;
        }

        renderCoreServices() {
            // const url = this.runtime.config('services.runtime.Workspace.url');

            const params = {
                runtime: this.runtime,
                services: [
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
                ]
            };
            return  html`<${AboutServicesComponent} ...${params}/>`;
        }

        renderDynamicServices() {
            const params = {
                runtime: this.runtime
            };
            return html`
                <${AboutDynamicServices} ...${params} />
            `;
        }

        render() {
            const content = html`
                <div style=${{margin: '10px'}}>
                    <h2>Core Services</h2>
                    ${this.renderCoreServices()}

                    <h2>Dynamic Services</h2>
                    ${this.renderDynamicServices()}
                </div>
            `;
            render(content, this.container);
        }

        // Widget API
        attach(node) {
            this.mount = node;
            this.container = this.mount.appendChild(document.createElement('div'));
        }

        detach() {
            if (this.mount && this.container) {
                this.mount.removeChild(this.container);
                this.container = null;
            }
        }

        start() {
            this.runtime.send('ui', 'setTitle', 'KBase Core and Dynamic Service Versions and Perf');
            return this.render();
        }

        stop() {
            return null;
        }
    }
    return AboutServices;
});
