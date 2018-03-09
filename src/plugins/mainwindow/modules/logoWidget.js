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
        img = t('img');

    function factory(config) {
        var hostNode, container, runtime = config.runtime;

        function attach(node) {
            hostNode = node;
            container = hostNode.appendChild(document.createElement('div'));
            container.classList.add('widget-logo');
        }

        function start() {
            // var uiTarget = runtime.config('buildInfo.target');
            // var version; 
            // if (uiTarget === 'prod') {
            //     version = runtime.config('release.version');
            // } else {
            //     version = uiTarget;
            // }
            container.innerHTML = [
                a({
                    href: runtime.config('resources.docSite.base.url'),
                    class: '-logo',
                    dataKbaseWidget: 'logo'
                }, img({
                    src: Plugin.plugin.fullPath + '/images/kbase_logo.png',
                    width: '46px'
                }))
                // div({
                //     class: '-label'
                // }, [
                //     div({
                //         style: {
                //             display: 'inline-block',
                //             lineHeight: 'normal',
                //             verticalAlign: 'bottom'
                //         }
                //     }, [
                //         div({
                //             style: {
                //                 marginBottom: '-6px'
                //             }
                //         }, 'hub'),
                //         div({
                //             style: {
                //                 textAlign: 'right',
                //                 fontSize: '10px',
                //                 fontWeight: 'bold',
                //                 color: 'gray'
                //             }
                //         }, version)
                //     ]),
                //     img({
                //         src: Plugin.plugin.fullPath + '/images/hub32.png',
                //         width: '32px'
                //     })
                // ])
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
