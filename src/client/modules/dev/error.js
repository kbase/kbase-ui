/* global define */
/*jslint
 white: true, browser: true
 */
define([
],
    function () {
        'use strict';
        var errors = {};
        function addError(id, def) {
            errors[String(id)] = def;
        }
        function getError(id) {
            return errors[String(id)];
        }
        addError(1, {
            name: 'MissingArgument',
            subject: 'object_reference',
            type: 'application_error',
            message: 'No object reference provided',
            suggestion: 'Provide an object reference in the argument named "ref"',
            infoUrl: 'some url here'
        });
        addError(2, {
            name: 'MissingConfigArg',
            message: 'Invalid taxon construction - configuration required',
            url: 'some url here'
        });
        var KBError = Object.create(Error, {
            name: {
                get: function () {
                    return this._name;
                },
                set: function (value) {
                    this._name = value;
                }
            },
            subject: {
                get: function () {
                    return this._subject;
                },
                set: function (value) {
                    this._subject = value;
                }
            },
            type: {
                get: function () {
                    return this._type;
                },
                set: function (value) {
                    this._type = value;
                }
            },
            origin: {
                get: function () {
                    return this._origin;
                },
                set: function (value) {
                    this._origin = value;
                }
            },
            id: {
                get: function () {
                    return this._id;
                },
                set: function (value) {
                    this._id = value;
                }
            },
            suggestion: {
                get: function () {
                    return this._suggestion;
                },
                set: function (value) {
                    this._suggestion = value;
                }
            },
            infoUrl: {
                get: function () {
                    return this._infoUrl;
                },
                set: function (value) {
                    this._infoUrl = value;
                }
            }
        });

        function getErrorObject(arg) {
            if (typeof arg === 'number') {
                arg = getError(arg);
            }
            var errObj = Object.create(KBError);
            errObj.name = arg.name;
            errObj.type = arg.type;
            errObj.subject = arg.subject;
            errObj.message = arg.message;
            errObj.origin = arg.origin;
            errObj.id = arg.id;
            errObj.suggestion = arg.suggestion;
            errObj.infoUrl = arg.infoUrl;
            return errObj;
        }
        function makeErrorObject(arg) {
            if (typeof arg === 'number') {
                arg = getError(arg);
            }
            var errObj = Object.create({});
            Object.keys(arg).forEach(function (key) {
                errObj[key] = arg[key];
            });
            errObj.stack = (new Error()).stack;
            return errObj;
        }

        return {
            getErrorObject: getErrorObject,
            makeErrorObject: makeErrorObject
        };
    });