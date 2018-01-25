define([
    'knockout-plus',
    'kb_common/html',
    '../clock'
], function(
    ko,
    html,
    Clock
) {
    'use strict';

    var t = html.tag,
        span = t('span'),
        div = t('div');

    function niceDuration(value, options) {
        options = options || {};
        var minimized = [];
        var units = [{
            unit: 'millisecond',
            short: 'ms',
            single: 'm',
            size: 1000
        }, {
            unit: 'second',
            short: 'sec',
            single: 's',
            size: 60
        }, {
            unit: 'minute',
            short: 'min',
            single: 'm',
            size: 60
        }, {
            unit: 'hour',
            short: 'hr',
            single: 'h',
            size: 24
        }, {
            unit: 'day',
            short: 'day',
            single: 'd',
            size: 30
        }];
        var temp = Math.abs(value);
        var parts = units
            .map(function (unit) {
                // Get the remainder of the current value
                // sans unit size of it composing the next
                // measure.
                var unitValue = temp % unit.size;
                // Recompute the measure in terms of the next unit size.
                temp = (temp - unitValue) / unit.size;
                return {
                    name: unit.single,
                    unit: unit.unit,
                    value: unitValue
                };
            }).reverse();

        parts.pop();

        // We skip over large units which have not value until we
        // hit the first unit with value. This effectively trims off
        // zeros from the end.
        // We also can limit the resolution with options.resolution
        var keep = false;
        for (var i = 0; i < parts.length; i += 1) {
            if (!keep) {
                if (parts[i].value > 0) {
                    keep = true;
                    minimized.push(parts[i]);
                }
            } else {
                minimized.push(parts[i]);
                if (options.resolution &&
                    options.resolution === parts[i].unit) {
                    break;
                }
            }
        }

        if (minimized.length === 0) {
            // This means that there is are no time measurements > 1 second.
            return '<1s';
        } else {
            // Skip seconds if we are into the hours...
            // if (minimized.length > 2) {
            //     minimized.pop();
            // }
            return minimized.map(function (item) {
                return String(item.value) + item.name;
            })
                .join(' ');
        }
    }

    function viewModel(params) {
        var startTime = ko.utils.unwrapObservable(params.startTime);
        if (startTime instanceof Date) {
            startTime = startTime.getTime();
        }
        // var startTime = .getTime();

        // var currentTime = ko.observable(new Date().getTime());
        var currentTime = ko.observable((new Date()).getTime());

        var listener = Clock.globalClock.listen(function () {
            currentTime((new Date()).getTime());
        }, params.updateInterval || 1);

        var elapsed = ko.pureComputed(function () {
            if (startTime) {
                var e =  currentTime() - startTime;
                return niceDuration(e);
            } 
            return 'n/a';
        });
        
        function dispose() {
            if (listener) {
                Clock.globalClock.forget(listener);
            }
        }

        return Object.freeze({
            elapsed: elapsed,
            // LIFECYCLE
            dispose: dispose
        });
    }
    
    function template() {
        return div([
            span({
                dataBind: {
                    text: 'elapsed'
                }
            })
        ]);
    }

    function component() {
        return {
            viewModel: viewModel,
            template: template()
        };
    }

    return component;
});