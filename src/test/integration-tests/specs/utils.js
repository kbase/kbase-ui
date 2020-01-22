/*eslint-env node */
/*eslint strict: ["error", "global"] */

'use strict';

var yaml = require('js-yaml');
var fs = require('fs');

function loadJSONFile(file) {
    var contents = fs.readFileSync(file, 'utf8');
    return JSON.parse(contents);
}

function loadYAMLFile(file) {
    var contents = fs.readFileSync(file, 'utf8');
    return yaml.safeLoad(contents);
}

function extend(path, elements) {
    if (!path) {
        return elements;
    }
    var newPath = path.map(function (el) {
        return el;
    });
    elements.forEach(function (element) {
        newPath.push(element);
    });
    return newPath;
}

function info() {
    const args = Array.prototype.slice.call(arguments);
    process.stdout.write(args.join(' ') + '\n');
}

function getProp(obj, propPath, defaultValue) {
    if (typeof propPath === 'string') {
        propPath = propPath.split('.');
    } else if (!(propPath instanceof Array)) {
        throw new TypeError('Invalid type for key: ' + typeof propPath);
    }
    for (let i = 0; i < propPath.length; i += 1) {
        if (obj === undefined || typeof obj !== 'object' || obj === null) {
            return defaultValue;
        }
        obj = obj[propPath[i]];
    }
    if (obj === undefined) {
        return defaultValue;
    }
    return obj;
}

function isValidNumber(theNumber, comparisonSpec) {
    for (const [comparisonName, comparisonValue] of Array.from(Object.entries(comparisonSpec))) {
        switch (comparisonName) {
        case 'gt':
        case 'greaterThan':
            return theNumber > comparisonValue;
        case 'gte':
        case 'greaterThanOrEqual':
            return theNumber >= comparisonValue;
        case 'lt':
        case 'lessThan':
            return theNumber < comparisonValue;
        case 'lte':
        case 'lessThanOrEqual':
            return theNumber <= comparisonValue;
        case 'exact':
        case 'equals':
        case 'equal':
            return theNumber === comparisonValue;
        default:
            throw new Error('Invalid numeric comparison: ' + comparisonName);
        }
    }
}

exports.loadJSONFile = loadJSONFile;
exports.loadYAMLFile = loadYAMLFile;
exports.extend = extend;
exports.info = info;
exports.getProp = getProp;
exports.isValidNumber = isValidNumber;
