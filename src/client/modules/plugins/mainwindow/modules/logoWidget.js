define([
    'kb_common/html',
    'kb_plugin_mainWindow'
], function (
    html,
    Plugin
) {
    'use strict';
    var t = html.tag,
        a = t('a'),
        img = t('img'),
        div = t('div'),
        span = t('span');

    function factory(config) {
        var hostNode, container, runtime = config.runtime;

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.classList.add('widget-logo');
        }

        function start() {
            container.innerHTML = [
                a({
                    href: runtime.config('resources.docSite.base.url'),
                    class: '-logo'
                }, img({
                    src: Plugin.plugin.fullPath + '/images/kbase_logo.png',
                    width: '46px'
                })),
                div({
                    class: '-label'
                }, [
                    'hub',
                    span({
                        class: 'fa fa-chevron-right -icon',
                        style: {
                            color: 'silver'
                        }
                    })
                ])
            ].join('');
        }

        function detach() {
            if (hostNode && container) {
                hostNode.removeChild(container);
            }
        }

        return {
            attach: attach,
            start: start,
            detach: detach,
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});
