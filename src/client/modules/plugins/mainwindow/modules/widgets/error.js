/*global define */
/*jslint white: true */
define([
    'kb/common/html',
    'kb/common/dom'
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
            var content, error = params.error;
            
            if (typeof error === 'string') {
                error = {
                    message: error
                };
            } else if (error instanceof Error) {
                error = {
                    message: error.message
                };
            }
            
            console.error('ERROR');
            console.error(error);
            
            if (params.error.data) {
                console.error(params.error.data);
            }
                
            content = html.makePanel({
                title: params.title,
                class: 'danger',
                content: html.makeRotatedTable([error], [
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
            if (mount) {
                mount.removeChild(container);
            }
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