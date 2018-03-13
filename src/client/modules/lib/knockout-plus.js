define([
    'numeral',
    'moment',
    'knockout',
    'uuid',
    'kb_common/utils',
    'kb_common/html',
    './lib/subscriptionManager',

    'knockout-mapping',
    'knockout-arraytransforms',
    './lib/knockout-es6-collections',
    'knockout-validation',
    'knockout-switch-case'
], function (
    numeral,
    moment,
    ko,
    Uuid,
    Utils,
    html,
    SubscriptionManager
) {
    // Knockout Defaults
    ko.options.deferUpdates = true;

    function isEmptyJSON(value) {
        if (value === undefined) {
            return true;
        }
        switch (value) {
        case '""':
            return true;
        case '[]':
            return true;
        case '{}':
            return true;
        case 'null':
            return true;
        }
    }

    ko.extenders.dirty = function (target, startDirty) {
        var lastValue = target();
        var cleanValue = ko.observable(ko.mapping.toJSON(target));

        var dirtyOverride = ko.observable(ko.utils.unwrapObservable(startDirty));

        target.isDirty = ko.computed(function () {
            var currentValue = ko.mapping.toJSON(target);
            var currentIsEmpty = isEmptyJSON(currentValue);
            var lastCleanValue = cleanValue();
            var cleanIsEmpty = isEmptyJSON(lastCleanValue);
            if (currentIsEmpty & cleanIsEmpty) {
                return false;
            }
            return dirtyOverride() || currentValue !== lastCleanValue;
        });

        target.markClean = function () {
            cleanValue(ko.mapping.toJSON(target));
            lastValue = target();
            dirtyOverride(false);
        };
        target.markDirty = function () {
            dirtyOverride(true);
        };
        target.reset = function () {
            target(lastValue);
        };

        return target;
    };

    ko.extenders.logChange = function (target, label) {
        target.subscribe(function (newValue) {
            console.log(label, newValue);
        });
        return target;
    };

    ko.extenders.enabled = function (target, config) {
        var isEnabled = ko.observable();
        target.isEnabled = isEnabled;

        function enableTest(newValue) {
            try {
                var enabled = isEnabled();
                var newEnabled = config.fun(newValue);
                if (enabled === undefined) {
                    // first time running.
                    isEnabled(newEnabled);
                } else {
                    if (enabled) {
                        if (!newEnabled) {
                            // reset target to be empty.
                            // target('');
                            isEnabled(false);
                        }
                    } else if (newEnabled) {
                        isEnabled(true);
                    }
                }
            } catch (ex) {
                console.error('Error running enable test: ' + ex.message);
            }
        }
        config.observable.subscribe(enableTest);
        // enableTest(config.observable());
    };

    ko.extenders.constraint = function (target, config) {
        target.constraint = {};
        target.constraint.description = config.description;
        target.constraint.messages = config.messages || {};

        if (config.required) {
            if (ko.isComputed(config.required)) {
                target.constraint.isRequired = config.required;
            } else if (ko.isObservable(config.required)) {
                target.constraint.isRequired = config.required;
            } else {
                target.constraint.isRequired = ko.observable(config.required);
            }
        } else {
            target.constraint.isRequired = ko.observable(false);
        }
        target.constraint.autoTrim = ko.observable(config.autoTrim || true);
        target.constraint.isValid = ko.observable(config.valid || true);
        target.constraint.message = ko.observable();
        target.constraint.state = ko.observable('new');

        function isEmpty(value) {
            if (typeof value === 'undefined' ||
                value === null) {
                return true;
            }
            if (typeof value === 'string') {
                if (target.constraint.autoTrim()) {
                    if (value.trim().length === 0) {
                        return true;
                    }
                }
            }
            if (value instanceof Array) {
                if (value.length === 0) {
                    return true;
                }
            }
            return false;
        }

        function validate() {
            try {
                var newValue = target();
                // first evaluate the required condition
                if (isEmpty(newValue)) {
                    if (target.constraint.isRequired()) {
                        target.constraint.message(target.constraint.messages.requiredButEmpty || 'Required but empty');
                        target.constraint.isValid(false);
                        target.constraint.state('required-missing');
                        return;
                    } else {
                        target.constraint.message('');
                        target.constraint.isValid(true);
                        target.constraint.state('empty-optional');
                        return;
                    }
                }

                // Then if it passes, run the validator
                if (!config.validate) {
                    target.constraint.message('');
                    target.constraint.isValid(true);
                    target.constraint.state('valid');
                    return;
                }
                var result = config.validate(newValue);
                if (typeof result === 'string') {
                    result = {
                        message: result
                    };
                }
                if (result) {
                    target.constraint.message(result.message || '');
                    target.constraint.isValid(false);
                    target.constraint.state('invalid');
                } else {
                    target.constraint.message('');
                    target.constraint.isValid(true);
                    target.constraint.state('valid');
                }
            } catch (ex) {
                target.constraint.message('Error running validation: ' + ex.message);
                console.error('Error running validation: ' + ex.message);
                target.constraint.isValid(false);
            }
        }

        validate(target());

        target.subscribe(validate);

        target.constraint.isRequired.subscribe(validate);

        return target;
    };

    function svgTemplateLoader(name, templateConfig, callback) {
        if (!templateConfig.svg) {
            callback(null);
            return;
        }
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.innerHTML = templateConfig.svg;
        callback(svg.childNodes);
    }
    ko.components.loaders.unshift({
        loadTemplate: svgTemplateLoader
    });

    // BINDINGS

    ko.bindingHandlers.numberText = {
        update: function (element, valueAccessor, allBindings) {
            var value = valueAccessor();
            var valueUnwrapped = ko.unwrap(value);
            var format = allBindings.get('numberFormat') || '';
            var formatted = numeral(valueUnwrapped).format(format);
            element.innerText = formatted;
        }
    };

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

    ko.bindingHandlers.typedText = {
        update: function (element, valueAccessor) {
            var value = valueAccessor();
            var valueUnwrapped = ko.unwrap(value.value);
            var format = value.format;
            var type = value.type;
            var missing = value.missing || '';
            var defaultValue = value.default;
            // var format = allBindings.get('type') || '';
            // var format = allBindings.get('numberFormat') || '';
            var formatted;

            switch (type) {
            case 'number':
                numeral.nullFormat('');
                if (valueUnwrapped === undefined || valueUnwrapped === null) {
                    formatted = missing;
                } else {                    
                    formatted = numeral(valueUnwrapped).format(format);
                }
                break;
            case 'date':
                if (valueUnwrapped === undefined || valueUnwrapped === null) {
                    formatted = missing;
                } else {
                    switch (format) {
                    case 'elapsed':
                    case 'nice-elapsed':
                        formatted = Utils.niceElapsedTime(moment(valueUnwrapped).toDate());
                        break;
                    case 'duration':
                        // formatted = Utils.niceElapsedTime(moment(valueUnwrapped).toDate());
                        formatted = niceDuration(valueUnwrapped);
                        break;
                    default: formatted = moment(valueUnwrapped).format(format);
                    }
                }
                break;
            case 'bool':
            case 'boolean':
                if (valueUnwrapped === undefined || valueUnwrapped === null) {
                    if (defaultValue === undefined) {
                        formatted = missing;
                        break;
                    }
                    valueUnwrapped = defaultValue;
                }
            
                if (valueUnwrapped) {
                    formatted = 'true';
                }
                formatted = 'false';

                break;
            case 'text':
            case 'string':
            default:
                formatted = valueUnwrapped;
            }

            element.innerText = formatted;
        }
    };

    // from: https://github.com/knockout/knockout/issues/914
    ko.subscribable.fn.subscribeChanged = function (callback, context) {
        var savedValue = this.peek();
        return this.subscribe(function (latestValue) {
            var oldValue = savedValue;
            savedValue = latestValue;
            callback.call(context, latestValue, oldValue);
        });
    };

    ko.subscribable.fn.syncWith = function (targetObservable, callbackTarget, event) {
        var sourceObservable = this; 
        sourceObservable(targetObservable());
        sourceObservable.subscribe(function (newValue) { 
            targetObservable(newValue); 
        }, callbackTarget, event); 
        targetObservable.subscribe(function (newValue) { 
            sourceObservable(newValue); 
        }, callbackTarget, event); 
        return sourceObservable; 
    };

    ko.subscribable.fn.syncFrom = function (targetObservable, callbackTarget, event) {
        var sourceObservable = this; 
        sourceObservable(targetObservable());
        targetObservable.subscribe(function (v) { 
            sourceObservable(v); 
        }, callbackTarget, event); 
        return sourceObservable; 
    };

    ko.subscribable.fn.syncTo = function (targetObservable, callbackTarget, event) {
        var sourceObservable = this; 
        targetObservable(sourceObservable());
        sourceObservable.subscribe(function (v) { 
            targetObservable(v); 
        }, callbackTarget, event); 
        return sourceObservable; 
    };

    // pure functions stuck onto ko

    var t = html.tag,
        div = t('div');

    function komponent(componentDef) {
        return '<!-- ko component: {name: "' + componentDef.name +
            '", params: {' +
            Object.keys(componentDef.params).map(function (key) {
                return key + ':' + componentDef.params[key];
            }).join(',') + '}}--><!-- /ko -->';
    }

    function createRootComponent(runtime, name) {
        var vm = {
            runtime: runtime,
            running: ko.observable(false)
        };
        var temp = document.createElement('div');
        temp.innerHTML = div({
            style: {
                flex: '1 1 0px',
                display: 'flex',
                flexDirection: 'column'
            }
        }, [
            '<!-- ko if: running -->',
            komponent({
                name: name,
                params: {
                    runtime: 'runtime'
                }
            }),
            '<!-- /ko -->'
        ]);
        var node = temp.firstChild;
        ko.applyBindings(vm, node, function (context) {
            context.runtime = runtime;
        });

        function start() {
            vm.running(true);
        }

        function stop() {
            vm.running(false);
        }
       
        return {
            vm: vm,
            node: node,
            start: start,
            stop: stop
        };
    }

    var installedStylesheets = {};
    function installStylesheet(id, stylesheet) {
        if (installedStylesheets[id]) {
            return;
        }
        var temp = document.createElement('div');
        temp.innerHTML = stylesheet;
        var style = temp.querySelector('style');
        style.id = 'componentStyle_' + id;
        if (!style) {
            // This means an invalid stylesheet was passed here.
            console.warn('Invalid component stylesheet, no style tag: ', stylesheet);
            return;
        }
        document.head.appendChild(style);
        installedStylesheets[id] = stylesheet;
    }


    function registerComponent(componentFactory) {
        var name = new Uuid(4).format();
        var component = componentFactory();
        ko.components.register(name, component);

        if (component.stylesheet) {
            installStylesheet(name, component.stylesheet);
        }

        return {
            name: function () {
                return name;
            },
            quotedName: function () {
                return '"' + name + '"';
            }
        };
    }


    function pluralize(expression, singular, plural) {
        return [
            '<!-- ko if: ' + expression + ' === 1 -->',
            singular,
            '<!-- /ko -->',
            '<!-- ko ifnot: ' + expression + ' === 1 -->',
            plural,
            '<!-- /ko -->'
        ];
    }

    ko.kb = {};

    ko.kb.komponent = komponent;
    ko.kb.createRootComponent = createRootComponent;
    ko.kb.registerComponent = registerComponent;
    // the subscription manager is a factory.
    // TODO: better way of integrating into knockout...
    ko.kb.SubscriptionManager = SubscriptionManager;
    ko.kb.pluralize = pluralize;

    return ko;
});
