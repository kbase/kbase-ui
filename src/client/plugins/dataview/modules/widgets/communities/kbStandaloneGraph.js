/*
 Graph Renderer
 
 Displays a graph of pie / bar charts with an optional legend.
 
 Options
 
 type (STRING)
 Defines the display type of the graph, can be one of
 pie
 column
 stackedColumn
 row
 stackedRow
 line
 stackedArea
 Default is column.
 
 title (STRING)
 Title string written at the top of the graph
 
 title_color (CSS Color Value)
 Color of the title text. Default is black.
 
 title_settings (SVG settings object)
 SVG settings for the title.
 
 x_title (STRING)
 Title written below the x-axis.
 
 y_title (STRING)
 Title written to the left of the y-axis.
 
 x_title_color (CSS Color Value)
 Color of the x-axis title string. Default is black.
 
 y_title_color (CSS Color Value)
 Color of the y-axis title string. Default is black.
 
 x_labels (ARRAY of STRING)
 List of the labels at the ticks of the x-axis.
 
 x_labels_rotation (STRING)
 A string representing the number of degrees to rotate the labels on the x-axis. Default is 0.
 
 y_labels (ARRAY of STRING)
 List of the labels at the ticks of the y-axis. If no list is passed will use the y-valus.
 
 x_tick_interval (INT)
 Determines how many ticks are actually drawn on the x-axis. Default is 0.
 
 y_tick_interval (INT)
 Determines how many ticks are actually drawn on the y-axis. Default is 30.
 
 x_labeled_tick_interval (INT)
 Determines which ticks on the x-axis get labels. Default is 1.
 
 y_labeled_tick_interval (INT)
 The number of y-axis ticks that get labels. Default is 5.
 
 default_line_color (CSS Color Value)
 Determines the color of lines if not specified for an individual line. Default is black.
 
 default_line_width (INT)
 Number of pixels lines should be wide if not specified for an individual line. Default is 1.
 
 show_legend (BOOLEAN)
 Turns the display of the legend on / off. Default ist true.
 
 legend_position (STRING)
 Can be one of
 left
 right
 top
 bottom
 
 chartArea (ARRAY of FLOAT)
 The values passed correspond to the left, top, width and height of the chart area respectively. The position is relative to the top left corner of the containing div. Values less than 1 are interpreted as fractions. Values greater than 1 are interpreted as absolute pixel values. Note that the labels are drawn to the left and bottom of these margins.
 
 legendArea (ARRAY of FLOAT)
 If this parameter is set, the legend_position parameter will not be used. Instead pass an array of floats. The values correspond to the left, top, width and height of the legend area respectively. The position is relative to the top left corner of the containing div. Values less than 1 are interpreted as fractions. Values greater than 1 are interpreted as absolute pixel values.
 
 width (INT)
 The width of the graph in pixel (including legend).
 
 height (INT)
 The height of the graph in pixel (including legend).
 
 data (ARRAY of OBJECT)
 List of data series. Each series has a name and a data attribute. The data attribute is a list of y-values for the series.
 
 onclick (FUNCTION)
 The passed function will be called when a bar / pie slice is clicked. It will receive an object with the attributes
 series - the name of the series this bar belongs to
 value  - the value of the bar
 label  - the label of the bar
 item   - the svg element that was clicked
 index  - the zero based index of this bar within its series
 series_index - the zero based index of this series
 
 normalize_stacked_area (boolean)
 If set to false the stacked area chart will not normalize the values
 */
/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'jquery',
    'kb_widget_dataview_communities_jquerySvg'
], // 'jquery-svg-graph-deviation', 'jquery-svg-graph-stacked-area'],
    function ($) {
        'use strict';
        var standaloneGraph = {
            about: {
                name: "graph",
                title: "Graph",
                author: "Tobias Paczian",
                version: "1.0"
            },
            defaults: {
                type: 'column', // [ column, stackedColumn, row, stackedRow, line, pie, stackedArea, deviation ]
                title: '',
                title_color: 'black',
                title_settings: {fontSize: '15px'},
                x_title: '',
                y_title: '',
                y2_title: '',
                x_title_color: 'black',
                y_title_color: 'black',
                y2_title_color: 'black',
                x_labels: [],
                x_labels_rotation: null,
                y_labels: [],
                y_scale: 'linear',
                y2_labels: [],
                y2_scale: 'linear',
                x_tick_interval: 0,
                y_tick_interval: 30,
                y2_tick_interval: 30,
                x_labeled_tick_interval: 1,
                y_labeled_tick_interval: 5,
                y2_labeled_tick_interval: 5,
                default_line_color: 'black',
                default_line_width: 1,
                show_legend: false,
                legend_position: 'right',
                show_grid: false,
                short_axis_labels: false,
                normalize_stacked_area: true,
                width: 800,
                height: 400
            },
            options: [
                {general: [
                        {
                            name: 'type',
                            type: 'select',
                            description: "type of the graph",
                            title: "type",
                            options: [
                                {value: "column", selected: true},
                                {value: "stackedColumn", label: "stacked column"},
                                {value: "row"},
                                {value: "stackedRow", label: "stacked row"},
                                {value: "line"},
                                {value: "pie"},
                                {value: "stackedArea", label: "stacked area"},
                                {value: "deviation", label: "deviation"}
                            ]
                        },
                        {
                            name: 'default_line_color',
                            type: 'color',
                            description: "default color of the data lines of the graph",
                            title: "default line color"
                        },
                        {
                            name: 'default_line_width',
                            type: 'int',
                            description: "default width of the data lines of the graph in pixel",
                            title: "default line width"
                        },
                        {
                            name: 'show_grid',
                            type: 'select',
                            description: "sets whether grid is displayed or not",
                            title: "show grid",
                            options: [
                                {value: 0, selected: true, label: "no"},
                                {value: 1, label: "yes"}
                            ]
                        }
                    ]
                },
                {
                    text: [
                        {
                            name: 'title',
                            type: 'text',
                            description: "title string of the graph",
                            title: "title"
                        },
                        {
                            name: 'title_color',
                            type: 'color',
                            description: "color of the title string of the graph",
                            title: "title color"
                        },
                        {
                            name: 'x_title',
                            type: 'text',
                            description: "title of the x-axis of the graph",
                            title: "x title"
                        },
                        {
                            name: 'y_title',
                            type: 'text',
                            description: "title of the y-axis of the graph",
                            title: "y title"
                        },
                        {
                            name: 'x_title_color',
                            type: 'color',
                            description: "color of the title of the x-axis of the graph",
                            title: "x title color"
                        },
                        {
                            name: 'y_title_color',
                            type: 'color',
                            description: "color of the title of the y-axis of the graph",
                            title: "y title color"
                        },
                        {
                            name: 'x_labels_rotation',
                            type: 'int',
                            description: "rotation in degrees of the x-axis labels",
                            title: "x label rotation"
                        }
                    ]
                },
                {layout: [
                        {
                            name: 'width',
                            type: 'int',
                            description: "width of the graph in pixel",
                            title: "width"
                        },
                        {
                            name: 'height',
                            type: 'int',
                            description: "height of the graph in pixel",
                            title: "height"
                        },
                        {
                            name: 'show_legend',
                            type: 'select',
                            description: "sets whether the legend is displayed or not",
                            title: "show legend", options: [
                                {value: 0, selected: true, label: "no"},
                                {value: 1, label: "yes"}
                            ]
                        },
                        {
                            name: 'legend_position',
                            type: 'select',
                            description: "position of the legend",
                            title: "legend position",
                            options: [{value: "left", selected: true},
                                {value: "right"},
                                {value: "top"},
                                {value: "bottom"}
                            ]
                        }
                    ]
                },
                {
                    axes: [
                        {
                            name: 'y_scale',
                            type: 'select',
                            description: "type of the scale of the y-axis",
                            title: "y scale",
                            options: [
                                {value: "linear", selected: true},
                                {value: "log"}
                            ]
                        },
                        {
                            name: 'x_tick_interval',
                            type: 'int',
                            description: "pixel distance of the minor tickmarks on the x-axis",
                            title: "minor x ticks"
                        },
                        {
                            name: 'y_tick_interval',
                            type: 'int',
                            description: "pixel distance of the minor tickmarks on the y-axis",
                            title: "minor y ticks"
                        },
                        {
                            name: 'x_labeled_tick_interval',
                            type: 'int',
                            description: "pixel distance of the major tickmarks on the x-axis",
                            title: "major x ticks"
                        },
                        {
                            name: 'y_labeled_tick_interval',
                            type: 'int',
                            description: "pixel distance of the major tickmarks on the y-axis",
                            title: "major y ticks"
                        },
                        {
                            name: 'short_axis_labels',
                            type: 'select',
                            description: "sets whether the axis labels should be shortened or not",
                            title: "short axis labels",
                            options: [
                                {value: 0, selected: true, label: "no"},
                                {value: 1, label: "yes"}
                            ]
                        }
                    ]
                }
            ],
            exampleData: function () {
                return [
                    {"name": 'IE', "data": [95, 91, 78, 66]},
                    {"name": 'Netscape', "data": [3, 12, 18, 18]},
                    {"name": 'Firefox', "data": [0, 4, 8, 9]},
                    {"name": 'Chrome', "data": [0, 8, 18, 22]},
                    {"name": 'Gecko', "data": [1, 2, 3, 33]}];
            },
            create: function (params) {
                var instance = {
                    settings: {},
                    index: params.index
                };
                // Create new graph instance, copying this instance into it.
                $.extend(true, instance, this);

                // Mix in the defaults and whatever the user provided in params.
                $.extend(true, instance.settings, this.defaults, params);

                // disable caching these, the user can do that themselves.
                // window.rendererGraph.push(instance);

                return instance;
            },
            render: function () {
                // get the target div
                var target = this.settings.target;
                target.innerHTML = "<div class='graph_div'></div>";
                target.firstChild.setAttribute('style', "width: " + this.settings.width + "px; height: " + this.settings.height + "px;");

                $(target).find('.graph_div').svg();

                var cmax = 0;
                if (this.settings.type === 'deviation' && !this.settings.data[0].data.hasOwnProperty('upper')) {
                    this.calculateData(this.settings.data);
                    cmax = this.cmax;
                }
                this.drawImage($(target).find('.graph_div').svg('get'), cmax);

                return this;
            },
            niceNum: function (range, round) {
                var exponent = Math.floor(Math.log10(range)); /** exponent of range */
                var fraction = range / Math.pow(10, exponent); /** fractional part of range */
                var niceFraction; /** nice, rounded fraction */

                if (round) {
                    if (fraction < 1.5) {
                        niceFraction = 1;
                    } else if (fraction < 3) {
                        niceFraction = 2;
                    } else if (fraction < 7) {
                        niceFraction = 5;
                    } else {
                        niceFraction = 10;
                    }
                } else {
                    if (fraction <= 1) {
                        niceFraction = 1;
                    } else if (fraction <= 2) {
                        niceFraction = 2;
                    } else if (fraction <= 5) {
                        niceFraction = 5;
                    } else {
                        niceFraction = 10;
                    }
                }

                return niceFraction * Math.pow(10, exponent);
            },
            /* get a nice scale, min, max and tick interval */
            niceScale: function (params) {
                var minPoint = params.min;
                var maxPoint = params.max;
                var maxTicks = params.ticks || 10;
                var range = this.niceNum(maxPoint - minPoint, false);
                var tickSpacing = this.niceNum(range / (maxTicks - 1), true);
                var niceMin = Math.floor(minPoint / tickSpacing) * tickSpacing;
                var niceMax = Math.ceil(maxPoint / tickSpacing) * tickSpacing;

                return {min: niceMin, max: niceMax, space: tickSpacing};
            },
            hover: function (title, value, event, e) {
                var id = e.currentTarget.ownerSVGElement.ownerSVGElement.parentNode.id;
                var index = id.substr(9);
                var svg = $('#' + id).svg('get');
                if (title) {
                    $(this, svg.root()).attr('fill-opacity', 0.8);
                    $(this, svg.root()).attr('title', title + ": " + value);
                } else {
                    $(this, svg.root()).attr('fill-opacity', 1);
                }
                if (event === 'click') {
                    var num = parseInt(this.parentElement.className.baseVal.substr(this.parentElement.className.baseVal.search(/\d+/)), 10);
                    svg.graph.options({explode: [num], explodeDist: 15});

                    if (typeof (this.settings.onclick) === "function") {
                        var label = "";
                        var i;
                        for (i = 0; i < this.parentElement.children.length; i += 1) {
                            if (this.parentElement.children[i] === this) {
                                if (this.getAttribute('r')) {
                                    i -= 1;
                                }
                                label = svg.graph.xAxis.labels().labels[i];
                                break;
                            }
                        }
                        this.settings.onclick({this: index, series: title, value: value, label: label, item: this, index: i, series_index: num, svg: svg});
                    }
                }
            },
            drawImage: function (svg, cmax) {
                var chartAreas = [[0.1, 0.1, 0.95, 0.9], // no legend
                    [0.2, 0.1, 0.95, 0.9], // legend left
                    [0.1, 0.1, 0.75, 0.9], // legend right
                    [0.1, 0.25, 0.9, 0.9], // legend top
                    [0.1, 0.1, 0.9, 0.8]]; // legend bottom

                var legendAreas = [[0.0, 0.0, 0.0, 0.0], // no legend
                    [0.005, 0.1, 0.125, 0.5], // left
                    [0.8, 0.1, 0.97, 0.5], // right
                    [0.2, 0.1, 0.8, 0.2], // top
                    [0.2, 0.9, 0.8, 0.995]]; // bottom

                var fills = ['url(#fadeBlue)', 'url(#fadeRed)', 'url(#fadeGreen)', 'url(#fadeYellow)', 'url(#fadeLightblue)', 'url(#fadePurple)'];

                var defs = svg.defs(),
                    max = 0,
                    y2max = 0,
                    i, h;
                for (i = 0; i < this.settings.data.length; i += 1) {
                    for (h = 0; h < this.settings.data[i].data.length; h += 1) {
                        if (this.settings.data[i].settings && this.settings.data[i].settings.isY2) {
                            if (parseFloat(this.settings.data[i].data[h]) > y2max) {
                                y2max = parseFloat(this.settings.data[i].data[h]);
                            }
                        } else {
                            if (parseFloat(this.settings.data[i].data[h]) > max) {
                                max = parseFloat(this.settings.data[i].data[h]);
                            }
                        }
                    }
                }
                max = cmax || max;

                svg.linearGradient(defs, 'fadeRed', [[0, '#EE5F5B'], [1, '#BD362F']]);
                svg.linearGradient(defs, 'fadeBlue', [[0, '#0088CC'], [1, '#0044CC']]);
                svg.linearGradient(defs, 'fadeGreen', [[0, '#62C462'], [1, '#51A351']]);
                svg.linearGradient(defs, 'fadeYellow', [[0, '#FBB450'], [1, '#F89406']]);
                svg.linearGradient(defs, 'fadeLightblue', [[0, '#5BC0DE'], [1, '#2F96B4']]);
                svg.linearGradient(defs, 'fadePurple', [[0, '#ee5be0'], [1, '#bd2fa6']]);

                svg.graph.shortAxisLabels = this.settings.short_axis_labels;
                svg.graph.normalizeStackedArea = this.settings.normalize_stacked_area;

                svg.graph.noDraw().title(this.settings.title, this.settings.title_color, this.settings.title_settings);
                svg.graph.noDraw().format('white', this.settings.show_grid ? 'gray' : 'white');
                if (this.settings.show_grid) {
                    svg.graph.noDraw().gridlines({stroke: 'gray', strokeDashArray: '2,2'}, 'gray');
                }

                for (i = 0; i < this.settings.data.length; i += 1) {
                    var series = [this.settings.data[i].name, this.settings.data[i].data, null, this.settings.data[i].lineColor || 'red', this.settings.data[i].lineWidth || this.settings.default_line_width, this.settings.data[i].settings || {}];
                    svg.graph.noDraw().addSeries(this.settings.data[i].name, this.settings.data[i].data, null, this.settings.data[i].lineColor || 'red', this.settings.data[i].lineWidth || this.settings.default_line_width, this.settings.data[i].settings || {});
                }

                svg.graph.xAxis.title(this.settings.x_title, this.settings.x_title_color).
                    ticks(this.settings.x_labeled_tick_interval, this.settings.x_tick_interval).
                    scale(0, 3);
                if (this.settings.x_labels.length) {
                    svg.graph.xAxis.labelRotation = this.settings.x_labels_rotation;
                    svg.graph.xAxis.labels(this.settings.x_labels);
                }
                var sy = this.niceScale({min: 0, max: max, ticks: this.settings.y_labeled_tick_interval});
                svg.graph.yAxis.
                    title(this.settings.y_title, this.settings.y_title_color).
                    ticks(sy.max / this.settings.y_labeled_tick_interval, sy.max / this.settings.y_tick_interval, null, null, this.settings.y_scale).
                    scale(0, max, this.settings.y_scale);

                if (this.settings.hasY2) {
                    svg.graph.y2Axis.
                        title(this.settings.y2_title || "", this.settings.y2_title_color).
                        ticks(parseInt(y2max / this.settings.y2_labeled_tick_interval, 10), parseInt(y2max / this.settings.y2_tick_interval, 10), null, null, this.settings.y_scale).
                        scale(0, y2max, this.settings.y2_scale);
                    if (this.settings.y2_labels.length) {
                        svg.graph.y2Axis.labels(this.settings.y2_labels);
                    }
                } else {
                    svg.graph.y2Axis = null;
                }

                if (this.settings.y_labels.length) {
                    svg.graph.yAxis.labels(this.settings.y_labels);
                }
                svg.graph.legend.settings({fill: 'white', stroke: 'white'});

                var chartType = this.settings.type;
                var chartLegend = 0;
                if (this.settings.show_legend) {
                    switch (this.settings.legend_position) {
                        case 'left':
                            chartLegend = 1;
                            break;
                        case 'right':
                            chartLegend = 2;
                            break;
                        case 'top':
                            chartLegend = 3;
                            break;
                        case 'bottom':
                            chartLegend = 4;
                            break;
                    }
                }
                var chartOptions = {barWidth: this.settings.barWidth || 25};

                svg.graph.status(this.hover);

                svg.graph.noDraw().
                    legend.show(this.settings.show_legend).area(this.settings.legendArea || legendAreas[chartLegend]).end();
                for (i = 0; i < this.settings.data.length; i += 1) {
                    svg.graph.noDraw().series(i).format(this.settings.data[i].fill || fills[i]).end();
                }
                svg.graph.noDraw().area(this.settings.chartArea || chartAreas[chartLegend]).
                    type(chartType, chartOptions).redraw();
            },
            calculateData: function (data) {
                var fivenumbers = [],
                    min = data[0].data[0],
                    max = data[0].data[0],
                    i;

                for (i = 0; i < data.length; i += 1) {
                    data[i].data = data[i].data.sort(function (a, b) {
                        return a - b;
                    });
                    if (data[i].data[0] < min) {
                        min = data[i].data[0];
                    }
                    if (data[i].data[data[i].data.length - 1] > max) {
                        max = data[i].data[data[i].data.length - 1];
                    }
                    fivenumbers[i] = [];
                    fivenumbers[i]['min'] = data[i].data[0];
                    fivenumbers[i]['max'] = data[i].data[data[i].data.length - 1];
                    var boxarray = [];
                    if (data[i].data.length % 2 === 1) {
                        var med = parseInt(data[i].data.length / 2);
                        fivenumbers[i]['median'] = data[i].data[med];
                        if ((med + 1) % 2 === 1) {
                            fivenumbers[i]['lower'] = data[i].data[parseInt((med + 1) / 2)];
                            fivenumbers[i]['upper'] = data[i].data[med + parseInt((med + 1) / 2)];
                        } else {
                            fivenumbers[i]['lower'] = ((data[i].data[(med + 1) / 2]) + (data[i].data[((med + 1) / 2) + 1])) / 2;
                            fivenumbers[i]['upper'] = ((data[i].data[med + ((med + 1) / 2) - 1]) + (data[i].data[med + ((med + 1) / 2)])) / 2;
                        }
                    } else {
                        var medup = data[i].data.length / 2;
                        var medlow = (data[i].data.length / 2) - 1;
                        fivenumbers[i]['median'] = (data[i].data[medlow] + data[i].data[medup]) / 2;
                        if (medup % 2 === 1) {
                            fivenumbers[i]['lower'] = data[i].data[medlow / 2];
                            fivenumbers[i]['upper'] = data[i].data[medup + (medlow / 2)];
                        } else {
                            fivenumbers[i]['lower'] = (data[i].data[(medup / 2) - 1] + data[i].data[medup / 2]) / 2;
                            fivenumbers[i]['upper'] = (data[i].data[medup + (medup / 2) - 1] + data[i].data[medup + (medup / 2)]) / 2;
                        }
                    }
                }

                for (var i = 0; i < data.length; i++) {
                    this.settings.data[i].data = [fivenumbers[i]];
                }
                this.cmax = max;
            }
        };
        return standaloneGraph;
    });
