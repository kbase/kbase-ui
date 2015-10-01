/*global
 define
 */
/*jslint
 browser: true,
 white: true
 */
define([
    'kb_common_apiUtils',
    'kb_common_utils',
    'kb_common_html',
    'kb_common_dom',
    'kb_service_workspace',
    'promise',
    'kb_types',
    'kb_common_state'
],
    function (APIUtils, Utils, html, dom, Workspace, Promise, types, stateFactory) {
        'use strict';

        function factory(config) {
            var mount, container, runtime = config.runtime,
                workspaceId,
                objectId,
                objectVersion,
                objectRef,
                subObject = config.sub,
                state = stateFactory.make(),
                workspaceClient = new Workspace(runtime.getConfig('services.workspace.url'), {
                    token: runtime.getService('session').getAuthToken()
                });



            function fetchVersions() {
                return Promise.resolve(workspaceClient.get_object_history({
                    ref: objectRef
                }))
                    .then(function (dataList) {
                        var versions = dataList.map(function (version) {
                            return APIUtils.object_info_to_object(version);
                        });
                        state.set('versions', versions.sort(function (a, b) {
                            return b.version - a.version;
                        }));
                    });
            }

            function fetchOutgoingReferences() {
                return Promise.resolve(workspaceClient.get_object_provenance([{ref: objectRef}]))
                    .then(function (provdata) {
                        var refs = provdata[0].refs,
                            provenace = provdata[0].provenance;
                        provenace.forEach(function (item) {
                            refs = refs.concat(item.resolved_ws_objects);
                        });
                        if (refs.length > 100) {
                            state.set('too_many_out_refs', true);
                        } else {
                            state.set('too_many_out_refs', false);
                        }
                        console.log('REFS');
                        console.log(refs);
                        return refs;
                    });
            }
            function fetchObjectInfo(refs) {
                //really need a ws method to get referenced object info
                //do to this correctly. For now, just dump the reference
                //if it's not visible
                console.log('REFS2');
                console.log(refs);
                return Promise.try(function () {
                    if (refs.length < 1) {
                        return;
                    }
                    var objIds = refs.map(function (ref) {
                        return {ref: ref};
                    });
                    return Promise.resolve(workspaceClient.get_object_info_new({
                        objects: objIds,
                        ignoreErrors: 1
                    }))
                        .then(function (dataList) {
                            var objects = dataList.filter(function (data) {
                                if (data) {
                                    return true;
                                }
                                return false;
                            }).map(function (data) {
                                return APIUtils.object_info_to_object(data);
                            });
                            state.set('out_references', objects.sort(
                                function (a, b) {
                                    return b.name - a.name;
                                }));
                        });
                });
            }
            function checkRefCount() {
                return Promise.resolve(workspaceClient.list_referencing_object_counts([{
                        ref: objectRef
                    }]))
                    .then(function (sizes) {
                        if (sizes[0] > 100) {
                            state.set('too_many_inc_refs', true);
                        } else {
                            state.set('too_many_inc_refs', false);
                        }
                    });
            }
            function setError(type, error) {
                state.set('status', 'error');
                var err = error.error;
                console.error(err);
                var message;
                if (typeof err === 'string') {
                    message = err;
                } else {
                    message = err.message;
                }
                state.set('error', {
                    type: type,
                    code: 'error',
                    shortMessage: 'An unexpected error occured',
                    originalMessage: message
                });
            }
            function fetchReferences() {
                return Promise.resolve(workspaceClient.list_referencing_objects([{
                        ref: objectRef
                    }]))
                    .then(function (dataList) {
                        var refs = [];
                        if (dataList[0]) {
                            for (var i = 0; i < dataList[0].length; i++) {
                                refs.push(APIUtils.object_info_to_object(dataList[0][i]));
                            }
                        }
                        state.set('inc_references', refs.sort(function (a, b) {
                            return b.name - a.name;
                        }));
                        return refs;
                    });

            }
            function createDataIcon(object_info) {
                try {
                    var typeId = object_info[2],
                        type = types.parseTypeId(typeId);
                    var icon = types.getIcon({type: type});

                    var code = 0;
                    for (var i = 0; i < type.length; code += type.charCodeAt(i++))
                        ;
                    var colors = [
                        "#F44336",
                        "#E91E63",
                        "#9C27B0",
                        "#3F51B5",
                        "#2196F3",
                        "#673AB7",
                        "#FFC107",
                        "#0277BD",
                        "#00BCD4",
                        "#009688",
                        "#4CAF50",
                        "#33691E",
                        "#2E7D32",
                        "#AEEA00",
                        "#03A9F4",
                        "#FF9800",
                        "#FF5722",
                        "#795548",
                        "#006064",
                        "#607D8B"
                    ];
                    var color = colors[code % colors.length];

                    var div = html.tag('div'),
                        span = html.tag('span'),
                        i = html.tag('i');
                    var logo = div([
                        span({class: 'fa-stack fa-2x'}, [
                            i({class: 'fa fa-circle fa-stack-2x', style: {color: color}}),
                            i({class: 'fa-inverse fa-stack-1x ' + icon.classes.join(' ')})
                        ])
                    ]);

                    return logo;
                } catch (err) {
                    console.error('When fetching icon config: ', err);
                    return '';
                }
            }
            function fetchData() {
                // return Promise.try() {
                // return new Promise(function (resolve, reject, notify) {
                //if (this.getParam('sub')) {
                //    state.set('sub', this.getParam('sub'));
                //}

                return Promise.resolve(workspaceClient.get_object_info_new({
                    objects: [{
                            ref: objectRef
                        }],
                    includeMetadata: 1
                }))
                    .then(function (data) {
                        console.log('STEP 1');
                        if (!data || data.length === 0) {
                            state.set('status', 'notfound');
                            throw new Error('notfound');
                        }
                        state.set('status', 'found');
                        var obj = APIUtils.object_info_to_object(data[0]);
                        state.set('object', obj);

                        // create the data icon
                        state.set('dataicon', createDataIcon(data[0]));
                    })
                    .then(function () {
                        console.log('STEP 2');
                        // The narrative this lives in.
                        // YUCK!
                        var isIntegerId = /^\d+$/.test(workspaceId);
                        return Promise.resolve(workspaceClient.get_workspace_info({
                            id: isIntegerId ? workspaceId : null,
                            workspace: isIntegerId ? null : workspaceId
                        }))
                            .then(function (data) {
                                state.set('workspace', APIUtils.workspace_metadata_to_object(data));
                            });
                    })
                    .then(function () {
                        console.log('STEP 3');

                        return fetchVersions();
                    })
                    .then(function () {
                        console.log('STEP 4');
                        return checkRefCount();
                    })
                    .then(function () {
                        console.log('STEP 5');

                        return fetchReferences();
                    })
                    .then(function () {
                        console.log('STEP 6');

                        return fetchOutgoingReferences();
                    })
                    .then(function (refs) {
                        console.log('STEP 7');
                        console.log(refs);
                        return fetchObjectInfo(refs);
                    })
                    .then(function () {
                        // Other narratives this user has.
                        Promise.resolve(workspaceClient.list_workspace_info({
                            perm: 'w'
                        }))
                            .then(function (data) {
                                var objects = data.map(function (x) {
                                    return APIUtils.workspace_metadata_to_object(x);
                                });
                                var narratives = objects.filter(function (obj) {
                                    if (obj.metadata.narrative && (!isNaN(parseInt(obj.metadata.narrative))) &&
                                        // don't keep the current narrative workspace.
                                        obj.id !== workspaceId &&
                                        obj.metadata.narrative_nice_name &&
                                        obj.metadata.is_temporary && obj.metadata.is_temporary !== 'true') {
                                        return true;
                                    } else {
                                        return false;
                                    }
                                });
                                state.set('writableNarratives', narratives);
                            });

                    });

            }

            function renderLayout() {
                var div = html.tag('div');
                return html.makePanel({
                    title: 'Data Overview',
                    content: div([
                        div({dataPlaceholder: 'alert'}),
                        div({dataPlaceholder: 'content'})
                    ])
                });
            }
            var div = html.tag('div'),
                h3 = html.tag('h3'),
                h4 = html.tag('h4'),
                span = html.tag('span'),
                p = html.tag('p'),
                a = html.tag('a'),
                table = html.tag('table'),
                tr = html.tag('tr'),
                th = html.tag('th'),
                td = html.tag('td');
            function renderTitleRow() {
                return tr({style: {verticalAlign: 'baseline'}}, [
                    th(state.get('dataicon')),
                    td((function () {
                        if (state.get('sub.id')) {
                            return [
                                td(h3(state.get('sub.subid'))),
                                td(['(in', a({href: '#dataview/' + objectRef}, state.get('object.name')), ')'])
                            ];
                        } else {
                            return [
                                td(h3(state.get('object.name'))),
                                td(['v', state.get('object.version')])
                            ];
                        }
                    }()))
                ]);
            }
            function renderTypeRow() {
                return tr([
                    th('Type'),
                    td([
                        (function () {
                            if (state.get('sub.sub')) {
                                return get('sub.sub') + ' in ';
                            } else {
                                return '';
                            }
                        }()),
                        a({href: '#spec/type/' + state.get('object.type'), target: '_blank'}, state.get('object.typeName'))
                    ])
                ]);
            }
            function renderNarrativeRow() {
                if (state.get('workspace.metadata.narrative_nice_name')) {
                    return tr([
                        th('In Narrative'),
                        td(a({href: '/narrative/ws.' + state.get('workspace.id') + '.' + state.get('object.id'),
                            target: '_blank'}, state.get('workspace.metadata.narrative_nice_name')))
                    ]);
                }
                return '';
            }
            function getScheme() {
                return window.location.protocol;
            }
            function getHost() {
                return window.location.host;
            }
            function renderPermalinkRow() {
                var permalink = getScheme() + '//' + getHost() +
                    '#dataview/' + objectRef;
                if (state.get('sub.subid')) {
                    permalink += '?' + state.get('sub.sub') + '&' + state.get('sub.subid');
                }
                return tr([
                    th('Permalink'),
                    td(({href: permalink}, permalink))
                ]);
            }
            function panel(content) {
                var id = html.genId(),
                    headingId = 'heading_' + id,
                    bodyId = 'body_' + id;
                return div({class: 'panel panel-default'}, [
                    div({class: 'panel-heading', role: 'tab', id: headingId}, [
                        h4({class: 'panel-title'}, [
                            span({dataToggle: 'collapse', dataParent: '#' + content.parent, dataTarget: '#' + bodyId, ariaExpanded: 'false', ariaControls: bodyId, class: 'collapsed', style: {cursor: 'pointer'}}, [
                                span({class: 'fa angle-right'}, [
                                    content.title
                                ])
                            ])
                        ])
                    ]),
                    div({id: bodyId, class: 'panel-collapse collapse', role: 'tabpanel', ariaLabelledby: headingId}, [
                        div({class: 'panel-body'}, [
                            content.body
                        ])
                    ])
                ]);
            }
            function renderMetadataPanel() {
                var body, metadata = state.get('object');
                console.log(metadata);
                if (metadata && (metadata.length > 0)) {
                    body = table({class: 'table'}, [
                        Object.keys(metadata).map(function (key) {
                            return tr([
                                td(key),
                                td(metadata[key])
                            ]);
                        })
                    ]);
                } else {
                    body = 'no metadata for this object';
                }
                return panel({
                    title: 'Raw Metadata',
                    body: body
                });
            }
            function render() {

                return div({class: 'row'}, [
                    div({class: 'col-sm-6'}, [
                        table({class: 'kb-dataview-header-tbl'}, [
                            renderTitleRow()
                        ]),
                        table({class: 'table'}, [
                            renderTypeRow(),
                            renderNarrativeRow(),
                            tr([
                                th('Last Updated'),
                                td([
                                    state.get('object.save_date')
                                ])
                            ]),
                            renderPermalinkRow()
                        ])
                    ]),
                    div({class: 'col-sm-6'}, [
                        div({class: 'panel-group', id: 'accordion', role: 'tablist', ariaMultiselectable: 'true'}, [
                            renderMetadataPanel()

                        ])
                    ])
                ]);
            }

            // Widget lifecycle API

            function init(config) {
                return Promise.try(function () {
                });
            }
            function attach(node) {
                return Promise.try(function () {
                    mount = node;
                    container = dom.createElement('div');
                    mount.appendChild(container);
                    container.innerHTML = renderLayout();
                });
            }
            function start(params) {
                return Promise.try(function () {
                    workspaceId = params.workspaceId;
                    objectId = params.objectId;
                    objectVersion = params.objectVersion;
                    objectRef = APIUtils.makeWorkspaceObjectRef(workspaceId, objectId, objectVersion);
                    if (!workspaceId) {
                        throw 'Workspace ID is required';
                    }

                    if (!objectId) {
                        throw 'Object ID is required';
                    }
                    return fetchData()
                        .then(function () {
                            container.innerHTML = renderLayout();
                            var content = container.querySelector('[data-placeholder="content"]');
                            if (content) {
                                content.innerHTML = render();
                            }
                        })
                        .catch(function (err) {
                            console.log('ERROR');
                            console.log(err);
                            if (err.status && err.status === 500) {
                                // User probably doesn't have access -- but in any case we can just tell them
                                // that they don't have access.
                                if (err.error.error.match(/^us.kbase.workspace.database.exceptions.NoSuchObjectException:/)) {
                                    state.set('status', 'notfound');
                                    state.set('error', {
                                        type: 'client',
                                        code: 'notfound',
                                        shortMessage: 'This object does not exist',
                                        originalMessage: err.error.message
                                    });
                                } else if (err.error.error.match(/^us.kbase.workspace.database.exceptions.InaccessibleObjectException:/)) {
                                    state.set('status', 'denied');
                                    state.set('error', {
                                        type: 'client',
                                        code: 'denied',
                                        shortMessage: 'You do not have access to this object',
                                        originalMessage: err.error.message
                                    });
                                } else {
                                    state.set('status', 'error');
                                    state.set('error', {
                                        type: 'client',
                                        code: 'error',
                                        shortMessage: 'An unknown error occured',
                                        originalMessage: err.error.message
                                    });
                                }
                                resolve();
                            } else {
                                state.set('error', {
                                    type: 'general',
                                    code: 'error',
                                    shortMessage: 'An unknown error occured'
                                });
                            }
                        });

                });
            }
            function stop() {
                return Promise.try(function () {
                });
            }
            function detach() {
                return Promise.try(function () {
                    mount.removeChild(container);
                });
            }
            function destroy() {
                return Promise.try(function () {
                });
            }

            return {
                init: init,
                attach: attach,
                start: start,
                stop: stop,
                detach: detach,
                destroy: destroy
            };

        }
        return {
            make: function (config) {
                return factory(config);
            }
        };
    });



//                            Navbar.addDropdown({
//                                place: 'end',
//                                name: 'download',
//                                style: 'default',
//                                icon: 'download',
//                                label: 'Download',
//                                widget: 'kbaseDownloadPanel',
//                                params: {'ws': this.getState('workspace.id'), 'obj': this.getState('object.id'), 'ver': this.getState('object.version')}
//                            });
//
//                            Navbar
//                                .addButton({
//                                    name: 'copy',
//                                    label: '+ New Narrative',
//                                    style: 'primary',
//                                    icon: 'plus-square',
//                                    url: '/functional-site/#/narrativemanager/new?copydata=' + dataRef,
//                                    external: true
//                                })
/*.addButton({
 name: 'download',
 label: 'Download',
 style: 'primary',
 icon: 'download',
 callback: function () {
 alert('download object');
 }.bind(this)
 })*/;



//                            var narratives = this.getState('writableNarratives');
//                            if (narratives) {
//                                var items = [], i;
//                                for (i = 0; i < narratives.length; i++) {
//                                    var narrative = narratives[i];
//                                    items.push({
//                                        name: 'narrative_' + i,
//                                        icon: 'file',
//                                        label: narrative.metadata.narrative_nice_name,
//                                        external: true,
//                                        callback: (function (narrative) {
//                                            var widget = this;
//                                            return function (e) {
//                                                e.preventDefault();
//                                                widget.copyObjectToNarrative(narrative);
//                                            };
//                                        }.bind(this))(narrative)
//                                    });
//                                }
//                                Navbar.addDropdown({
//                                    place: 'end',
//                                    name: 'options',
//                                    style: 'default',
//                                    icon: 'copy',
//                                    label: 'Copy',
//                                    items: items
//                                });
//                            }
//                            break;
//                        case 'notfound':
//                            Navbar
//                                .setTitle('<span style="color: red;">This Object was Not Found</span>')
//                                .clearButtons();
//                            this.places.content.html(this.renderTemplate('error'));
//                            break;
//                        case 'denied':
//                            Navbar
//                                .setTitle('<span style="color: red;">Access Denied to this Object</span>')
//                                .clearButtons();
//                            this.places.content.html(this.renderTemplate('error'));
//                            break;
//                        case 'error':
//                            Navbar
//                                .setTitle('<span style="color: red;">An Error has Occurred Accessing this Object</span>')
//                                .clearButtons();
//                            this.places.content.html(this.renderTemplate('error'));
//                            break;
//                        default:
//                            Navbar
//                                .setTitle('An Error has Occurred Accessing this Object')
//                                .clearButtons();
//                            state.set('error', {
//                                type: 'internal',
//                                code: 'invalidstatus',
//                                shortMessage: 'The internal status "' + this.getState('status') + '" is not suppored'
//                                    // originalMessage: err.message
//                            });
//                            this.places.content.html(this.renderTemplate('error'));
//                            break;
//                    }
//
//                }
//            },

/**
 copy the current ws object to the given narrative.
 TODO: omit the workspace for the current data object.
 */
//            function copyObjectToNarrative(narrativeWs) {
//                var from = this.getObjectRef();
//                var to = narrativeWs.id + '';
//                var name = this.getState('object.name');
//
//                Promise.resolve(this.workspaceClient.copy_object({
//                    from: {ref: from},
//                    to: {wsid: to, name: name}
//                }))
//                    .then(function (data) {
//                        if (data) {
//
//                            var narrativeUrl = this.makeUrl('/narrative/' + APIUtils.makeWorkspaceObjectId(narrativeWs.id, narrativeWs.metadata.narrative));
//                            this.alert.addSuccessMessage('Success', 'Successfully copied this data object to Narrative <i>' +
//                                narrativeWs.metadata.narrative_nice_name + '</i>.  <a href="' + narrativeUrl + '" target="_blank">Open this Narrative</a>');
//                        } else {
//                            this.alert.addErrorMessage('Error', 'An unknown error occurred copying the data.');
//                        }
//                    }.bind(this))
//                    .catch(function (err) {
//                        if (err.error && err.error.message) {
//                            var msg = err.error.message;
//                        } else {
//                            var msg = '';
//                        }
//                        this.alert.addErrorMessage('Error', 'Error copying the data object to the selected Narrative. ' + msg);
//                        console.log('ERROR');
//                        console.log(err);
//                    }.bind(this))
//                    .done();
//
//            }