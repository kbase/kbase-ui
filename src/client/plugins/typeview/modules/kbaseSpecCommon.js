/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'google-code-prettify'
],
    function (PR) {
        'use strict';
        PR.registerLangHandler(
            PR.createSimpleLexer(
                [
                    // Whitespace
                    [PR.PR_PLAIN, /^[\t\n\r \xA0]+/, null, '\t\n\r \xA0'],
                    // A double or single quoted, possibly multi-line, string.
                    /* TODO: test and fix this ... I don't think this works 
                     * TODO: and also the jslint warnings about ^ and . should be heeded
                     *   http://stackoverflow.com/questions/3039955/jslint-reports-insecure-for-my-regex-what-does-that-mean
                     *   */
                    [PR.PR_STRING, /^(?:"(?:[^\"\\]|\\.)*"|'(?:[^\'\\]|\\.)*')/, null,
                        '"\'']
                ],
                [
                    [PR.PR_COMMENT, /^(?:\/\*[\s\S]*?(?:\*\/|$))/],
                    [PR.PR_KEYWORD, /^\b(?:module|typedef|funcdef|authentication|returns)\b/, null],
                    // A number is a hex integer literal, a decimal real literal, or in
                    // scientific notation.
                    [PR.PR_LITERAL,
                        /^\b(?:string|int|float|UnspecifiedObject|list|mapping|structure|tuple)\b/],
                    // An identifier
                    [PR.PR_PLAIN, /^[a-z_][\w-]*/i],
                    // A run of punctuation
                    [PR.PR_PUNCTUATION, /^[^\w\t\n\r \xA0\"\'][^\w\t\n\r \xA0+\-\"\']*/]
                ]),
            ['spec']);

        /* TODO: replace with grouped matches */
        function replaceMarkedTypeLinksInSpec(curModule, specText, aClass) {
            var patt = /#[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+-[0-9]+\.[0-9]+#/,
                m;
            while (true) {
                m = patt.exec(specText);
                if (m === null) {
                    break;
                }
                m = m[0];
                var pos = specText.indexOf(m);
                var id = m.substr(1, m.length - 2);
                var name = id.substring(0, id.indexOf('-'));
                var module = name.substring(0, name.indexOf('.'));
                if (module === curModule) {
                    name = name.substr(name.indexOf('.') + 1);
                }
                var link = '<a onclick="specClicks[\'' + aClass + '\'](this,event); return false;" data-typeid="' + id + '">' + name + '</a>';
                specText = specText.substr(0, pos) + link + specText.substr(pos + m.length);
            }
            return specText;
        }

        var lastGeneratedSpecPrefix = 0;

        var generateSpecPrefix = function () {
            lastGeneratedSpecPrefix += 1;
            return lastGeneratedSpecPrefix;
        };

        var specClicks = {};

        return {
            replaceMarkedTypeLinksInSpec: replaceMarkedTypeLinksInSpec,
            generateSpecPrefix: generateSpecPrefix
        };

    });
