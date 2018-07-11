define([
    'kb_common/html'
], function (
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        span = t('span');

    class DeploymentWidget {
        constructor(params) {
            this.runtime = params.runtime;
            this.hostNode = null;
            this.container = null;
        }

        attach(node) {
            this.hostNode = node;
            this.container = node;
        }

        start() {
            // Do not show the deployment widget for prod
            if (this.runtime.config('deploy.environment') === 'prod') {
                return;
            }
            this.container.innerHTML = div({
                style: {
                    border: '1px silver solid',
                    padding: '3px',
                    margin: '2px'
                }
            }, [
                div({
                    style: {
                        textAlign: 'center',
                        fontWeight: 'bold',
                    }
                }, this.runtime.config('deploy.environment').toUpperCase()),
                div({
                    style: {
                        textAlign: 'center'
                    }
                }, span({
                    class: ['fa', 'fa-2x', 'fa-' + this.runtime.config('deploy.icon')]
                }))
            ]);
        }

        detach() {
            this.container.innerHTML = '';
        }
    }

    return {Widget: DeploymentWidget};
});
