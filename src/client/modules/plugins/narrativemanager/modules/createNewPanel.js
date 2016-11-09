/*global define*/
/*jslint white:true*/
define([
    'bluebird',
    'kb/common/html',
    'kb/common/dom',
    'kb_sdk_clients/genericClient'
], function (Promise, html, dom, ServiceClient) {
    'use strict';

    function factory(config) {
        var mount, container, runtime = config.runtime;

        function makeNarrativePath(wsId, objId) {
            return runtime.getConfig('services.narrative.url') + '/narrative/ws.' + wsId + '.obj.' + objId;
        }

        function createNewNarrative(params) {
            var client = new ServiceClient({
                module: 'NarrativeService',
                url: runtime.getConfig('services.service_wizard.url'),
                token: runtime.service('session').getAuthToken(),
                version: 'dev'
            });
            params.includeIntroCell = 1;
            return client.callFunc('create_new_narrative', [params])
            .then(function (info) {
                info = info[0];
                var wsId = info.narrativeInfo.wsid,
                    objId = info.narrativeInfo.id,
                    path = makeNarrativePath(wsId, objId);
                return {
                    redirect: {
                        url: path,
                        newWindow: false
                    }
                }
            });
        }

        function wrapPanel(content) {
            var div = html.tag('div');
            return div({class: 'container-fluid'}, [
                div({class: 'row'}, [
                    div({class: 'col-md-12'}, [
                        content
                    ])
                ])
            ]);
        }



        // API

        function attach(node) {
            mount = node;
            container = dom.createElement('div');
            mount.appendChild(container);
        }

        function start(params) {
            var div = html.tag('div'),
                a = html.tag('a'),
                p = html.tag('p');
            container.innerHTML = wrapPanel(html.loading('Creating a new Narrative for you...'));
            return new Promise(function (resolve, reject) {
                createNewNarrative(params)
                    .then(function (result) {
                        container.innerHTML = wrapPanel([
                            p('Opening your new Narrative.'),
                            p('If the Narrative did not open, use this link'),
                            p(a({href: result.redirect.url, target: '_blank'}, [
                                'Open your new Narrative: ',
                                result.redirect.url
                            ]))
                        ]);
                        runtime.send('app', 'redirect', {
                            url: result.redirect.url,
                            new_window: false
                        });
                        resolve();
                    })
                    .catch(function (err) {
                        container.innerHTML = 'ERROR creating and opening a new narrative';
                        console.log('ERROR creating and opening a new narrative');
                        console.log(err);
                        reject(err);
                    });
            });
        }

        function stop() {
            // nothing to do?
        }

        function detach() {
            mount.removeChild(container);
            container.innerHTML = '';
            container = null;
        }

        return {
            attach: attach,
            start: start,
            stop: stop,
            detach: detach
        };
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };

});
