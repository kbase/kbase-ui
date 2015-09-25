/*global define */
/*jslint white: true, browser: true */
define([
    'vega'
],
    function (Vega) {
        'use strict';
        function makeColumnSpec(options) {
            return {
                width: options.width || 400,
                height: options.height || 400,
                padding: {top: 10, left: 30, bottom: 30, right: 10},
                data: [
                    {
                        name: 'columnData',
                        values: options.data
                    }
                ],
                scales: [
                    {
                        name: 'x',
                        type: 'ordinal',
                        range: 'width',
                        domain: {data: 'columnData', field: 'label'}
                    },
                    {
                        name: 'y',
                        type: 'linear',
                        range: 'height',
                        domain: {data: 'columnData', field: 'value'},
                        nice: true
                    }
                ],
                axes: [
                    {type: 'x', scale: 'x'},
                    {type: 'y', scale: 'y'}
                ],
                marks: [
                    {
                        type: 'rect',
                        from: {data: 'columnData'},
                        properties: {
                            enter: {
                                x: {scale: 'x', field: 'label'},
                                width: {scale: 'x', band: true, offset: -1},
                                y: {scale: 'y', field: 'value'},
                                y2: {scale: 'y', value: 0}
                            },
                            update: {
                                fill: {value: options.color}
                            },
                            hover: {
                                fill: {value: options.hover.color}
                            }
                        }
                    }
                ]
            };
        }

        function makeScatterSetSpec(options) {
            return {
                width: options.width,
                height: options.height,
                data: options.data,
                scales: [
                    {
                        name: 'x', type: 'linear',
                        range: 'width', zero: true,
                        domain: {
                            fields: options.data.map(function (d) {
                                return {
                                    data: d.name,
                                    field: 'x'
                                };
                            })
                        }
                    },
                    {
                        name: 'y', type: 'linear',
                        range: 'height',
                        nice: true, zero: true,
                        domain: {
                            fields: options.data.map(function (d) {
                                return {
                                    data: d.name,
                                    field: 'y'
                                };
                            })
                        }
                    }
                ],
                axes: [
                    {type: 'x', scale: 'x', offset: 5, ticks: 5, title: options.xAxis.title},
                    {type: 'y', scale: 'y', offset: 5, ticks: 5, title: options.yAxis.title}
                ],
                marks: options.data.map(function (d) {
                    return {
                        type: 'symbol',
                        from: {'data': d.name},
                        properties: {
                            enter: {
                                x: {scale: 'x', field: 'x'},
                                y: {scale: 'y', field: 'y'},
                                fillOpacity: {value: 1},
                                size: {value: 100},
                                fill: {value: d.color}
                            }
                        }
                    };
                })
            };
        }
        function makeScatterSpec(options) {
            return {
                "width": options.width,
                "height": options.height,
                "data": [
                    {
                        name: 'scatter',
                        values: options.data
                    }
                ],
                "scales": [
                    {
                        "name": "x", "type": "linear",
                        "range": "width", "zero": true,
                        "domain": {data: 'scatter', field: 'x'}
                    },
                    {
                        "name": "y", "type": "linear",
                        "range": "height",
                        "nice": true, "zero": true,
                        "domain": {data: 'scatter', field: 'y'}
                    }
                ],
                "axes": [
                    {"type": "x", "scale": "x", "offset": 5, "ticks": 5, "title": options.xAxis.title},
                    {"type": "y", "scale": "y", "offset": 5, "ticks": 5, "title": options.yAxis.title}
                ],
                "marks": [
                    {
                        "type": "symbol",
                        "from": {"data": 'scatter'},
                        "properties": {
                            "enter": {
                                "x": {"scale": "x", "field": "x"},
                                "y": {"scale": "y", "field": "y"},
                                "fillOpacity": {"value": 1},
                                "size": {"value": options.size},
                                "fill": {"value": options.color}
                            }
                        }
                    }
                ]
            };
        }


        // Simple stats

        function binData(data, binCount) {
            var i,
                min,
                max,
                range,
                binSize,
                bins = [],
                labels = [],
                table = [],
                bin;
            // Calculate min and max.
            data.forEach(function (value) {
                if (min === undefined) {
                    min = value;
                } else if (value < min) {
                    min = value;
                }
                if (max === undefined) {
                    max = value;
                } else if (value > max) {
                    max = value;
                }
            });
            range = max - min;
            binSize = range / binCount;

            // Setup bins and labels.
            for (i = 0; i < binCount; i += 1) {
                bins[i] = 0;
                labels[i] = String((binSize * i + min).toFixed(2));
                table[i] = {
                    label: labels[i],
                    value: 0
                };
            }

            // Calculate histograms.
            data.forEach(function (value) {
                bin = Math.floor((value - min) / binSize);
                if (bin >= binCount) {
                    bin = binCount - 1;
                }
                bins[bin] += 1;
                table[bin].value += 1;
            });

            // Make a table form.

            return {
                min: min,
                max: max,
                binCount: binCount,
                binSize: binSize,
                bins: bins,
                labels: labels,
                table: table
            };
        }


        return {
            spec: {
                column: makeColumnSpec,
                scatter: makeScatterSpec,
                scatterSet: makeScatterSetSpec
            },
            stat: {
                binData: binData
            }
        };
    });