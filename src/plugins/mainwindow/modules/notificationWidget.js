define([
    'knockout',
    'kb_lib/html',
    './components/notification'
], function (
    ko,
    html,
    NotificationComponent
) {
    'use strict';

    var t = html.tag,
        div = t('div');

    class NotificationWidget {
        constructor(params) {
            this.runtime = params.runtime;
            this.hostNode = null;
            this.container = null;
        }

        attach(node) {
            this.container = node;
        }

        start() {
            this.container.innerHTML = div({
                dataBind: {
                    component: {
                        name: NotificationComponent.quotedName(),
                        params: {
                            runtime: 'runtime'
                        }
                    }
                }
            });
            const vm = {
                runtime: this.runtime
            };
            try {
                ko.applyBindings(vm, this.container);
            } catch (err) {
                console.error('Error binding', err);
            }

        }
    }

    return {Widget: NotificationWidget};
});
