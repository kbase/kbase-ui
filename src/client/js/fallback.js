(function (root) {

    let errorCount = 0;

    function parseQuery(queryString) {
        const query = {};
        queryString.split('&').forEach(function (field) {
            const parts = field.split('=');
            query[parts[0]] = root.decodeURIComponent(parts[1]);
        });
        return query;
    }

    function getQuery() {
        return parseQuery(window.location.search.slice(1));
    }

    function cleanBrowser() {
        root.document.body.className = '';
    }

    function renderLayout() {
        cleanBrowser();
        root.document.title = 'Application Error - KBase';
        root.document.getElementById('root').innerHTML =
            '<div style="font-size: 16px; font-family: Arial,sans-serif;">' +
            // header with kbase icon, title, and menu
            '  <div style="position: relative; height: 50px; width: 100%; background-color: #F0ADAD; line-height: 50px">' +
            '    <div style="position: absolute; top: 2px; left: 2px; width: 46px; height: 46px;">' +
            '      <a href="https://www.kbase.us"><img src="/images/kbase_logo.png" style="display: block;"></a>' +
            '    </div>' +
            '    <div style="display: inline-block; font-weight: bold; font-size: 150%; margin-left: 70px; vertical-align: middle;">' +
            '      Application Error' +
            '    </div>' +
            '    <div style="float: right; height: 100%;">' +
            '      <div style="display: inline-block; font-weight: bold; margin: 0 6px; vertical-align: middle;">' +
            '        <a href="https://kbase.us/support">Support</a>' +
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
        let referencesSection;
        if (references) {
            referencesSection = '<h2>References</h2>' + references;
        } else {
            referencesSection = '';
        }
        const errorBody =
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
        let queryString;
        if (query) {
            queryString = Object.keys(query)
                .map((key) => {
                    return [key, encodeURIComponent(query[key])].join('=');
                }).join('&');
        }
        return [path, queryString].filter((el) => {
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

        const content = arg.content
            .filter((paragraph) => {
                if (paragraph) {
                    return true;
                }
                return false;
            })
            .map((paragraph) => {
                return '<p>' + paragraph + '</p>';
            }).join('\n');

        const references = (() => {
            if (arg.references) {
                return '<ul>' + arg.references.map((reference) => {
                    return '<li><a href="' + reference.url + '" target="_blank">' +
                            reference.title + '</a></li>';
                }).join('\n') + '</ul>';
            }
        })();

        renderError(arg.title, content, references);
    }

    root.KBaseFallback = {
        getQuery,
        makeUrl,
        redirect,
        showError,
        getErrorState
    };

}(window));