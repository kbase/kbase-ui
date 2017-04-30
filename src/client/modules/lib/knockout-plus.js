define([
    'knockout',
    'knockout-mapping',
    'knockout-arraytransforms',
    'knockout-validation'
], function (ko) {


    ko.extenders.dirty = function (target, startDirty) {
        var lastValue = target();
        var cleanValue = ko.observable(ko.mapping.toJSON(target));
        var dirtyOverride = ko.observable(ko.utils.unwrapObservable(startDirty));

        target.isDirty = ko.computed(function () {
            return dirtyOverride() || ko.mapping.toJSON(target) !== cleanValue();
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

    return ko;
});