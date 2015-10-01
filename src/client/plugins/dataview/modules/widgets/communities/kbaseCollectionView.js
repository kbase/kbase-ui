/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
/**
 * KBase widget to display a Metagenome Collection
 */
define([
    'jquery',
    'bluebird',
    'kb.service.workspace',
    'kb.runtime',
    'kb.html',
    // no parameters
    'datatables_bootstrap',
    'kb.jquery.authenticatedwidget'
],
    function ($, Promise, Workspace, R, html) {
        'use strict';
        $.KBWidget({
            name: 'CollectionView',
            parent: 'kbaseAuthenticatedWidget',
            version: '1.0.0',
            token: null,
            options: {
                id: null,
                ws: null
            },
            ws_url: R.getConfig('services.workspace.url'),
            init: function (options) {
                this._super(options);
                return this;
            },
            render: function () {
                var self = this,
                    container = this.$elem;
                container.empty();
                if (self.token === null) {
                    container.append('<div>[Error] You are not logged in</div>');
                    return;
                }
                container.append(html.loading('loading data...'));

                var workspace = new Workspace(self.ws_url, {token: self.token}),
                    title;
                Promise.resolve(workspace.get_objects([{ref: self.options.ws + '/' + self.options.id}]))
                    .then(function (data) {
                        if (data.length === 0) {
                            throw new Error('Object ' + self.options.id + ' does not exist in workspace ' + self.options.ws);
                        }
                        /* TODO: resolve this issue 
                         * Some objects have an "actual" URL - surprise! */
                        var collectionObject = data[0].data,
                            idList = collectionObject.members.map(function (member) {
                                if (member.URL.match(/^http/)) {
                                    console.log('ERROR');
                                    console.log(member);
                                    throw new Error('Invalid Collection Object');
                                }
                                return {ref: member.URL};
                            });
                        title = collectionObject.name;
                        if (idList.length > 0) {
                            return new Promise.resolve(workspace.get_objects(idList));
                        } else {
                            throw new Error('Collection is empty');
                        }
                    })
                    .then(function (resData) {
                        var rows = resData.map(function (item) {
                            return [
                                item.data.id,
                                item.data.name,
                                item.data.mixs.project_name,
                                item.data.mixs.PI_lastname,
                                item.data.mixs.biome,
                                item.data.mixs.sequence_type,
                                item.data.mixs.seq_method,
                                item.data.statistics.sequence_stats.bp_count_raw,
                                item.data.created
                            ];
                        }),
                            options = {
                                columns: ['ID', 'Name', 'Project', 'PI', 'Biome', 'Sequence Type', 'Sequencing Method', 'bp Count', 'Created'],
                                rows: rows,
                                classes: ['table', 'table-striped'],
                            },
                        table = html.makeTable(options),
                            div = html.tag('div'),
                            h4 = html.tag('h4'),
                            content = div([
                                h4('<h4>Metagenome Collection ' + title),
                                table
                            ]);
                        container.html(content);
                        $('#' + options.generated.id).dataTable();
                    })
                    .catch(function (err) {
                        var message;
                        if (err.error) {
                            message = err.error.message;
                        } else if (err.message) {
                            message = err.message;
                        } else {
                            message = 'Unknown error';
                        }
                        container.html($('<p>')
                            .css({'padding': '10px 20px'})
                            .text('[Error] ' + message));
                    })
                    .done();
                return self;
            },
            loggedInCallback: function (event, auth) {
                this.token = auth.token;
                this.render();
                return this;
            },
            loggedOutCallback: function (event, auth) {
                this.token = null;
                this.render();
                return this;
            }
        });
    });
