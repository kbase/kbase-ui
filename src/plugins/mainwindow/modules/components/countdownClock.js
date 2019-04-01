define([
    'knockout',
    'kb_knockout/registry',
    'kb_knockout/lib/generators',
    'kb_lib/html'
], function (
    ko,
    reg,
    gen,
    html
) {
    'use strict';

    const t = html.tag,
        span = t('span');

    class ViewModel {
        constructor(params) {
            this.startAt = params.startAt;
            this.endAt = params.endAt;

            this.now = ko.observable(Date.now());
            this.timer = window.setInterval(() => {
                this.now(Date.now());
            }, 250);
        }

        dispose() {
            if (this.timer) {
                window.clearInterval(this.timer);
            }
        }
    }

    function template() {
        return span({
            dataBind: {
                typedText: {
                    type: '"date-range"',
                    format: '"nice-relative-range"',
                    value: {
                        now: 'now',
                        startDate: 'startAt',
                        endDate: 'endAt'
                    }
                }
            }
        });
    }

    function component() {
        return {
            viewModel: ViewModel,
            template: template()
        };
    }

    return reg.registerComponent(component);
});