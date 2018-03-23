(function (root) {
    'use strict';

    var errorCount = 0;

    function parseQuery(queryString) {
        var query = {};
        queryString.split('&').forEach(function (field) {
            var parts = field.split('=');
            query[parts[0]] = root.decodeURIComponent(parts[1]);
        });
        return query;
    }

    function getQuery() {
        return parseQuery(window.location.search.slice(1));
    }

    // function cancelAMD() {
    //     var req = root.requirejs;
    //     if (req && req.s) {
    //         var waiting = req.s.contexts._.registry;
    //         Object.keys(waiting).forEach(function (id) {
    //             delete waiting[id];
    //         });
    //     }
    // }

    // function clearStylesheets() {
    //     var children = root.document.head.children,
    //         i, child;
    //     for (i = 0; i < children.length; i += 1) {
    //         child = children[i];
    //         if (child.tagName === 'LINK' && child.rel === 'stylesheet') {
    //             root.document.head.removeChild(child);
    //         }
    //     }
    // }

    function cleanBrowser() {
        root.document.body.className = '';
        // clearStylesheets();
        // cancelAMD();
    }

    function renderLayout() {
        cleanBrowser();
        root.document.title = 'Application Error - KBase';
        root.document.getElementById('root').innerHTML =
            '<div style="font-size: 16px; font-family: Arial,sans-serif;">' +
            // header with kbase icon, title, and menu
            '  <div style="position: relative; height: 50px; width: 100%; background-color: #F0ADAD; line-height: 50px">' +
            '    <div style="position: absolute; top: 2px; left: 2px; width: 46px; height: 46px;">' +
            '      <a href="http://kbase.us"><img src="/images/kbase_logo.png" style="display: block;"></a>' +
            '    </div>' +
            '    <div style="display: inline-block; font-weight: bold; font-size: 150%; margin-left: 70px; vertical-align: middle;">' +
            '      Application Error' +
            '    </div>' +
            '    <div style="float: right; height: 100%;">' +
            '      <div style="display: inline-block; font-weight: bold; margin: 0 6px; vertical-align: middle;">' +
            '        <a href="http://kbase.us/contact-us">Contact Us</a>' +
            '     </div>' +
            '    </div>' +
            '  </div>' +
            // main body
            '  <div style="padding: 1em;">' +
            '    <div id="content"></div>' +
            '  </div>' +
            '</div>';
    }

    function renderError(title, content, references) {
        cleanBrowser();
        var referencesSection;
        if (references) {
            referencesSection = '<h2>References</h2>' + references;
        } else {
            referencesSection = '';
        }
        var errorBody =
            '<div style="border: 1px #E04343 solid; padding: 4px; margin: 4px;">' +
            '  <div style="font-weight: bold; color: #E04343; padding: 4px; margin-bottom: 1em;">Error # ' + String(errorCount) + '</div>' +
            '  <h2>' + title + '</h2>' +
            '  <div>' + content + '</div>' +
            '  <div>' + referencesSection + '</div></div>' +
            '</div>',
            div = root.document.createElement('div');
        div.innerHTML = errorBody;
        root.document.getElementById('content').appendChild(div);
    }

    function makeUrl(path, query) {
        var queryString;
        if (query) {
            queryString = Object.keys(query).map(function (key) {
                return [key, encodeURIComponent(query[key])].join('=');
            }).join('&');
        }
        return [path, queryString].filter(function (el) {
            return el ? true : false;
        }).join('?');
    }

    function redirect(path, query) {
        root.location.href = makeUrl(path, query);
    }

    function getErrorState() {
        return errorCount;
    }

    function showError(arg) {
        if (!errorCount) {
            renderLayout();
        }
        errorCount += 1;
        var title = arg.title;
        var content = arg.content
                .filter(function (paragraph) {
                    if (paragraph) {
                        return true;
                    }
                    return false;
                })
                .map(function (paragraph) {
                    return '<p>' + paragraph + '</p>';
                }).join('\n'),
            references = (function () {
                if (arg.references) {
                    return '<ul>' + arg.references.map(function (reference) {
                        return '<li><a href="' + reference.url + '" target="_blank">' +
                            reference.title + '</a></li>';
                    }).join('\n') + '</ul>';
                }
            }());

        renderError(title, content, references);
    }

    root.KBaseFallback = {
        getQuery: getQuery,
        makeUrl: makeUrl,
        redirect: redirect,
        showError: showError,
        getErrorState: getErrorState
    };

}(window));