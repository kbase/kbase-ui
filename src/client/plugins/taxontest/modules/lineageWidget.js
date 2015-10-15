/*global define */
/*jslint white: true, browser: true */
define([
    'kb_widgetBases_panelWidget',
    'kb_common_html',
    'kb_taxon'
],
    function (standardWidgetFactory, html, Taxon) {
        'use strict';
        function makeSymbol(s) {
            return s.trim(' ').replace(/ /, '_');
        }
        function myWidget(config) {
            return standardWidgetFactory.make({
                runtime: config.runtime,
                on: {
                    initialContent: function (w, params) {
                        w.send('ui', 'setTitle', 'Loading Lineage ...');
                        return {
                            title: 'Loading Lineage ...',
                            content: html.loading('Loading...')
                        };
                    },
                    start: function (w, params) {
                        // Listen for a setTitle message sent to the ui.
                        // We use the widget convenience function in order to 
                        // get automatic event listener cleanup. We could almost
                        // as easily do this ourselves.
                        w.send('ui', 'setTitle', 'Rendering Lineage...');
                        var ref;
                        if (params.version) {
                            ref = params.workspace + '/' + params.object + '/' + params.version;
                        } else {
                            ref = params.workspace + '/' + params.object;
                        }
                        w.setState('objectRef', ref);
                    },
                    render: function (w) {
                        // Render a simple title.
                        // NB:this is called whenver the widget thinks it needs 
                        // to re-render the title, which is essentially when the 
                        // state is dirty (has been changed) and a heartbeat
                        // event is captured.
                        // '811/Sbicolor.JGI-v2.1'
                        var taxonClient = Taxon({
                            ref: w.getState('objectRef'),
                            token: config.runtime.getService('session').getAuthToken(),
                            url: 'http://euk.kbase.us/taxon'
                        }),
                            content,
                            ol = html.tag('ol'),
                            li = html.tag('li'),
                            a = html.tag('a'),
                            div = html.tag('div');
                        return taxonClient.getScientificName()
                            .then(function (name) {
                                content = div(['Scientific name: ', name]);
                                w.send('ui', 'setTitle', 'Lineage of ' + name);
                                return taxonClient.getScientificLineage();
                            })
                            .then(function (lineage) {
                                var pad = 0,
                                    items = lineage.map(function (item) {
                                        var id = 'lineage_item_' + makeSymbol(item),
                                            url = 'http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?name=' + item.trim(' ');
                                        pad += 10;
                                        return li({style: {paddingLeft: String(pad) + 'px'}, id: id}, [
                                            a({href: url, target: '_blank'}, item.trim(' '))]);
                                    });
                                    content += ol(items);
                                return {
                                    title: 'Taxon Lineage Widget',
                                    content: content
                                };
                            });
                    }
                }
            });
        }
        return {
            make: function (config) {
                return myWidget(config);
            }
        };
    });