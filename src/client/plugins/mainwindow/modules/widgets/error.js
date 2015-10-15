/*global define */
/*jslint white: true */
define([
    'kb_common_html',
    'kb_common_dom'
], function (html, dom) {
    'use strict';
    function factory(config) {
        var mount, container, runtime = config.runtime;
        function attach(node) {
            mount = node;
            container = dom.createElement('div');
            mount.appendChild(container);            
        }
        function start(params) {
            var div = html.tag('div'),
                span = html.tag('span'),
                content = html.makePanel({
                    title: params.title,
                    class: 'danger',
                    content: html.makeRotatedTable([params.error], [
                        {key: 'type', label: 'Type'},
                        {key: 'reason', label: 'Reason'},
                        {key: 'blame', label: 'Blame'},
                        {key: 'message', label: 'Message'},
                        {key: 'suggestions', label: 'Suggestions'}
                    ])
                });
            container.innerHTML = content;            
        }
        function stop() {
            // nothing to do?
        }
        function detach() {
            mount.removeChild(container);
        }
        
        return {
            attach: attach,
            start:start, 
            stop: stop,
            detach:detach
        };
    }
    
    return {
        make: function (config) {
            return factory(config);
        }
    };
});