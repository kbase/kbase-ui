define([
    'bluebird',
    'kb_common/html'
], function (
    Promise,
    html
) {
    'use strict';

    var t = html.tag,
        div = t('div'),
        table = t('table'),
        tr = t('tr'),
        td = t('td');

    function factory(config) {
        var container;

        function attach(node) {
            container = node;
        }

        function buildRow(count, label, color) {
            return div({
                style: {
                    verticalAlign: 'middle'
                }
            }, [
                div({
                    style: {
                        display: 'inline-block',
                        width: '40%',
                        textAlign: 'right',
                        paddingRight: '3px'
                    }
                }, String(count)),
                div({
                    style: {
                        display: 'inline-block',
                        width: '60%',
                        color: color
                    }
                }, label)
            ]);

        }

        function start(params) {
            container.innerHTML = div({
                style: {
                    height: '100%',
                    border: '1px silver solid',
                    fontSize: '90%'
                }
            }, [
                buildRow(0, 'info', 'blue'),
                buildRow(0, 'warn', 'orange'),
                buildRow(0, 'error', 'red')
            ]);
        }

        function stop() {

        }

        function detach() {

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