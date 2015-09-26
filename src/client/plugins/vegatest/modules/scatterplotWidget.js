/*global define */
/*jslint white: true, browser: true */
define([
    'bluebird',
    'kb_common_html',
    'kb_common_dom',
    'vega',
    'vegaChartHelper',
    'csv!iris.csv'
],
    function (Promise, html, dom, vega, vegaChartHelper, irisData) {
        'use strict';

        function getData(type) {
            return irisData
                .filter(function (d) {
                    if (d[5] === type) {
                        return true;
                    }
                    return false;
                })
                .map(function (d) {
                    return {
                        sepalLength: d[1],
                        sepalWidth: d[2],
                        petalLength: d[3],
                        petalWidth: d[4]
                    };
                })
                .map(function (d) {
                    return {x: d.petalLength, y: d.petalWidth};
                });
        }
        function getIrisData() {
            return [{
                    name: 'setosa',
                    color: 'green',
                    values: getData('setosa')
                },
                {
                    name: 'versicolor',
                    color: 'orange',
                    values: getData('versicolor')
                },
                {
                    name: 'virginica',
                    color: 'blue',
                    values: getData('virginica')
                }];
        }

        function widget(config) {
            var mount, container, scatterNode,
                species = ['setosa', 'versicolor', 'virginica'];

            function attach(node) {
                return Promise.try(function () {
                    mount = node;

                    var div = html.tag('div'),
                        id = html.genId(),
                        content = html.makePanel({
                            title: 'Vega Scatterplot Test',
                            content: div({id: id})
                        });
                    container = dom.createElement('div');
                    container.innerHTML = content;
                    dom.append(mount, container);
                    scatterNode = dom.nodeForId(id);
                });
            }
            function start(params) {
                return Promise.try(function () {
                    // build up the specs synchronously.
                    var scatter = vegaChartHelper.spec.scatterSet({
                        data: getIrisData(),
                        height: 400,
                        width: 700,
                        xAxis: {
                            title: 'Sepal Width'
                        },
                        yAxis: {
                            title: 'Petal Length'
                        }
                    });

                    vega.parse.spec(scatter, function (chart) {
                        chart({el: scatterNode}).update();
                    });
                });
            }
            function stop() {
                return Promise.try(function () {
                    return true;
                });
            }
            function detach() {
                return Promise.try(function () {
                    mount.removeChild(container);
                });
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
                return widget(config);
            }
        };
    });