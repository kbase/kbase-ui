define([
    'kb_lib/html',
    'kb_plugin_mainWindow'
], function (
    html,
    Plugin
) {
    'use strict';
    const t = html.tag,
        a = t('a'),
        img = t('img');

    class LogoWidget {
        constructor(params) {
            this.runtime = params.runtime;

            this.hostNode = null;
            this.container = null;
        }

        attach(node) {
            this.hostNode = node;
            this.container = this.hostNode.appendChild(document.createElement('div'));
            this.container.classList.add('widget-logo');
        }

        start() {
            this.container.innerHTML = [
                a({
                    href: this.runtime.config('resources.docSite.base.url'),
                    class: '-logo',
                    dataKBTesthookWidget: 'logo'
                }, img({
                    src: Plugin.plugin.fullPath + '/images/kbase_logo.png',
                    width: '46px'
                }))
            ].join('');
        }

        detach() {
            if (this.hostNode && this.container) {
                this.hostNode.removeChild(this.container);
            }
        }
    }

    return { Widget: LogoWidget };
});
