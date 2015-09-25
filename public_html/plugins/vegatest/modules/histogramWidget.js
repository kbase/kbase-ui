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

        function getIrisData(table, species, measure) {
            var data = [],
                columns = {};
            table[0].map(function (col, i) {
                columns[col] = i;
            });

            table.slice(1).forEach(function (row) {
                if (row[columns['Species']] === species) {
                    data.push(row[columns[measure]]);
                }
            });

            return data;
        }

        function widget(config) {
            var mount, container;
            var species = ['setosa', 'versicolor', 'virginica'];
            
            function init(config) {
                return Promise.try(function () {
                    return true;
                });
            }
            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    
                    var div = html.tag('div'),
                        content = html.makePanel({
                            title: ' Vega Histogram Test',
                            content: div([
                                species.map(function (specie) {
                                    return div({id: 'species_' + specie});
                                })
                            ])
                        });
                    
                    container = dom.createElement('div');
                    container.innerHTML = content;
                    dom.append(mount, container);
                });
            }
            function start(params) {
                return Promise.try(function () {
                    // build up the specs synchronously.
                    species.forEach(function (specie) {
                        var data = vegaChartHelper.stat.binData(getIrisData(irisData, specie, 'Petal.Length'), 20),
                            spec = vegaChartHelper.spec.column({
                                width: 600, height: 300,
                                data: data.table,
                                color: 'orange',
                                hover: {color: 'red'}
                            });
                        console.log(data);

                        vega.parse.spec(spec, function (chart) {
                            chart({el: '#species_' + specie}).update();
                        });
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
            function destroy() {
                return Promise.try(function () {
                    return true;
                });
            }
            return {
                init: init,
                attach: attach,
                start: start,
                stop: stop,
                detach: detach,
                destroy: destroy
            };
        }

        return {
            make: function (config) {
                return widget(config);
            }
        };
    });