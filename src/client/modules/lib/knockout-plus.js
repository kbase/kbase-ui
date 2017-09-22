define([
    'numeral',
    'moment',
    'knockout',
    'knockout-mapping',
    'knockout-arraytransforms',
    'knockout-validation',
    'knockout-switch-case'
], function (
    numeral,
    moment,
    ko
) {
    // Knockout Defaults
    ko.options.deferUpdates = true;

    // from: https://github.com/knockout/knockout/issues/914
    ko.subscribable.fn.subscribeChanged = function (callback, context) {
        var savedValue = this.peek();
        return this.subscribe(function (latestValue) {
            var oldValue = savedValue;
            savedValue = latestValue;
            callback.call(context, latestValue, oldValue);
        });
    };

    function isEmpty(value) {
        switch (typeof value) {
        case 'string':
            return (value.length === 0);
        case 'undefined':
            return true;
        case 'number':
            return false;
        case 'boolean':
            return false;
        case 'object':
            if (value instanceof Array) {
                return (value.length === 0);
            }
            if (value === null) {
                return true;
            }
            return false;
        default:
            return false;
        }
    }

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

    // ko.extenders.mytest = function (target, config) {
    //     target.test = ko.observable(true);
    //     return target;
    // };

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

    ko.bindingHandlers.typedText = {
        update: function (element, valueAccessor) {
            var value = valueAccessor();
            var valueUnwrapped = ko.unwrap(value.value);
            var format = value.format;
            var type = value.type;
            // var format = allBindings.get('type') || '';
            // var format = allBindings.get('numberFormat') || '';
            var formatted;
            switch (type) {
            case 'number':
                formatted = numeral(valueUnwrapped).format(format);
                break;
            case 'date':
                formatted = moment(valueUnwrapped).format(format);
                break;
            case 'text':
            case 'string':
            default:
                formatted = valueUnwrapped;
            }

            element.innerText = formatted;
        }
    };

    return ko;
});
