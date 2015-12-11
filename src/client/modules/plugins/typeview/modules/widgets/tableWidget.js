/*global define*/
/*jslint white: true*/
define([
    'bluebird',
    'kb/common/html',
    'kb/common/dom'
], function (Promise, html, dom) {
    'use strict';

    function factory(config) {
        var mount, container, runtime = config.runtime;

        // tags used in this module.
        var table = html.tag('table'),
            tr = html.tag('tr'),
            th = html.tag('th'),
            td = html.tag('td'),
            a = html.tag('a'),
            div = html.tag('div'),
            pre = html.tag('pre'),
            ul = html.tag('ul'),
            li = html.tag('li');


        var tableSettings = {
            sPaginationType: 'full_numbers',
            iDisplayLength: 10,
            aoColumns: [
                {sTitle: 'Module name', mData: 'name'},
                {sTitle: 'Module version', mData: 'ver'}
            ],
            aaData: null,
            oLanguage: {
                sSearch: config.messages.search,
                sEmptyTable: config.messages.emptyTable
            }
        };

        function tabTableContent() {
            return table({
                class: 'table table-striped table-bordered',
                style: {width: '100%'},
                dataAttach: 'table'});
        }

        function attach(node) {
            mount = node;
            container = mount.appendChild(dom.createElement('div'));
            container.innerHTML = tabTableContent();
        }
        function start(params) {

        }
        function run(params) {

        }
        function stop() {

        }
        function detach() {
            mount.removeChild(container);
        }

        return {
            attach: attach,
            start: start,
            run: run,
            stop: stop,
            detach: detach
        }
    }
    return {
        make: function (config) {
            return factory(config);
        }
    };
})