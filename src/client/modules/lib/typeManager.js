define(['kb_lib/props'], function (props) {
    'use strict';

    function factory(config) {
        var types = new props.Props({
                data: config.typeDefs
            }),
            defaultIcon = {
                type: 'fontAwesome',
                classes: ['fa-file-o']
            };

        function getIcon(arg) {
            var icon = types.getItem(['types', arg.type.module, arg.type.name, 'icon']) || defaultIcon,
                classes = icon.classes.map(function (x) {
                    return x;
                });
            switch (icon.type) {
            case 'kbase':
                classes.push('icon');
                if (arg.size) {
                    switch (arg.size) {
                    case 'small':
                        classes.push('icon-sm');
                        break;
                    case 'medium':
                        classes.push('icon-md');
                        break;
                    case 'large':
                        classes.push('icon-lg');
                        break;
                    }
                }
                break;
            case 'fontAwesome':
                classes.push('fa');
                break;
            }
            if (classes) {
                return {
                    classes: classes,
                    type: icon.type,
                    color: icon.color || getColor(arg.type),
                    html: '<span class="' + classes.join(' ') + '"></span>'
                };
            }
        }

        function getColor(type) {
            var code = 0,
                i,
                colors = [
                    '#F44336',
                    '#E91E63',
                    '#9C27B0',
                    '#3F51B5',
                    '#2196F3',
                    '#673AB7',
                    '#FFC107',
                    '#0277BD',
                    '#00BCD4',
                    '#009688',
                    '#4CAF50',
                    '#33691E',
                    '#2E7D32',
                    '#AEEA00',
                    '#03A9F4',
                    '#FF9800',
                    '#FF5722',
                    '#795548',
                    '#006064',
                    '#607D8B'
                ],
                color;

            for (i = 0; i < type.name.length; i += 1) {
                code += type.name.charCodeAt(i);
            }
            color = colors[code % colors.length];
            return color;
        }

        function hasType(typeQuery) {
            if (types.hasItem(['types', typeQuery.module, typeQuery.name])) {
                return true;
            }
            return false;
        }

        function getViewerById(arg) {
            var viewer = types.getItem(['types', arg.type.module, arg.type.name, 'viewersById', arg.id]);
            if (!viewer) {
                throw new Error(
                    'Viewer not found with this id ' + arg.id + ' for ' + arg.type.module + '.' + arg.type.name
                );
            }
            return viewer;
        }

        function getViewer(arg) {
            if (arg.id) {
                return getViewerById(arg);
            }
            var viewers = types.getItem(['types', arg.type.module, arg.type.name, 'viewers']);
            if (!viewers || viewers.length === 0) {
                return;
            }
            if (viewers.length === 1) {
                return viewers[0];
            }
            var defaults = viewers.filter(function (viewer) {
                if (viewer.default) {
                    return true;
                }
                return false;
            });
            if (defaults.length === 1) {
                var copy = Object.assign({}, defaults[0]);
                delete copy.default;
                return copy;
            }
            if (defaults.length === 0) {
                // If no default viewer, we will choose the first one
                // loaded. This prevents additional widgets from stomping
                // existing ones without cooperation.
                // return viewers[0];
                // throw new Error('No viewer defined for this type');
                // return;
                throw new Error('Multiple viewers defined for this type, but none are set as default');
            }
            throw new Error('Multiple default viewers defined for this type');
        }

        function checkViewers() {
            var modules = types.getItem('types'),
                problems = [];
            if (!modules) {
                return problems;
            }
            Object.keys(modules).forEach(function (moduleName) {
                var module = modules[moduleName];
                Object.keys(module).forEach(function (typeName) {
                    var type = module[typeName],
                        hasDefault = false;
                    if (!type.viewers) {
                        problems.push({
                            severity: 'warning',
                            type: 'no-viewers',
                            message: 'A registered type has no viewers: ' + moduleName + '.' + typeName,
                            info: {
                                module: moduleName,
                                type: typeName
                            }
                        });
                        return;
                    }
                    type.viewers.forEach(function (viewer) {
                        if (viewer.default) {
                            if (hasDefault) {
                                problems.push({
                                    severity: 'error',
                                    type: 'duplicate-default',
                                    message:
                                        'There is already a default viewer established ' + moduleName + '.' + typeName,
                                    info: {
                                        module: moduleName,
                                        type: typeName
                                    }
                                });
                            }
                            hasDefault = true;
                        }
                    });
                    if (!hasDefault) {
                        problems.push({
                            severity: 'error',
                            type: 'no-default',
                            message: 'There is no default viewer for this type: ' + moduleName + '.' + typeName,
                            info: {
                                module: moduleName,
                                type: typeName
                            }
                        });
                    }
                });
            });

            return problems;
        }

        /**
             * Adds a data vis widget to the runtime types.
             *
             * @function addViewer
             * @param {type} arg
             * @returns {undefined}
             * -
             default: true
             # This the title for the widget
             title: 'Data View 2'
             # This is the module name as specified in the plugin
             # it should follow standard namespacing
             module: kb_widget_dataview_communities_collection
             # This is the internal jquery object name for this widget.
             widget: CollectionView
             # If a bootstrap panel is requested to wrap this widget.
             panel: true
             # Mapping of standard options to the widget option properties.
             # By standard, I mean those defined in the GenericVisualizer widget.
             options:
             -
             from: workspaceId
             to: ws
             -
             from: objectId
             to: id
             -
             from: authToken
             to: token
             */
        function addViewer(type, viewerDef) {
            var typeDef = types.getItem(['types', type.module, type.name]);
            if (typeDef === undefined) {
                types.setItem(['types', type.module, type.name], {
                    viewers: []
                });
            }
            var viewers = types.getItem(['types', type.module, type.name, 'viewers']);
            if (!viewers) {
                viewers = [];
                types.setItem(['types', type.module, type.name, 'viewers'], viewers);
            }
            //                if (viewerDef.default) {
            //                    viewers.forEach(function (viewer) {
            //                        viewer.default = false;
            //                    });
            //                }
            viewers.push(viewerDef);

            // Also, may register by id
            if (viewerDef.id) {
                var byId = types.getItem(['types', type.module, type.name, 'viewersById']);
                if (!byId) {
                    byId = {};
                    types.setItem(['types', type.module, type.name, 'viewersById'], byId);
                }
                if (byId[viewerDef.id]) {
                    throw new Error('Viewer with this id already registered ' + viewerDef.id);
                }
                byId[viewerDef.id] = viewerDef;
            }
        }
        function setIcon(type, iconDef) {
            var typeDef = types.getItem(['types', type.module, type.name]);
            if (typeDef === undefined || typeDef === null) {
                types.setItem(['types', type.module, type.name], {
                    icon: iconDef
                });
            } else {
                types.setItem(['types', type.module, type.name, 'icon'], iconDef);
            }
        }

        function getDefault(prop) {
            return types.getItem(['defaults', prop]);
        }
        function makeTypeId(type) {
            return type.module + '.' + type.name + '-' + type.version.major + '.' + type.version.minor;
        }
        function parseTypeId(typeId) {
            var matched = typeId.match(/^(.+?)\.(.+?)-(.+?)\.(.+)$/);
            if (!matched) {
                throw new Error('Invalid data type ' + typeId);
            }
            if (matched.length !== 5) {
                throw new Error('Invalid data type ' + typeId);
            }

            return {
                module: matched[1],
                name: matched[2],
                version: {
                    major: matched[3],
                    minor: matched[4]
                }
            };
        }
        function makeType() {
            if (arguments.length === 1) {
                // make from an object.
                var spec = arguments[0];
                if (spec.version) {
                    var version = spec.version.split('.');
                    return {
                        module: spec.module,
                        name: spec.name,
                        version: {
                            major: version[0],
                            minor: version[1]
                        }
                    };
                }
            }
        }
        function makeVersion(type) {
            return type.version.major + '.' + type.version.minor;
        }

        return Object.freeze({
            getIcon: getIcon,
            setIcon: setIcon,
            getViewer: getViewer,
            getDefault: getDefault,
            makeTypeId: makeTypeId,
            parseTypeId: parseTypeId,
            makeType: makeType,
            makeVersion: makeVersion,
            addViewer: addViewer,
            hasType: hasType,
            checkViewers: checkViewers
        });
    }

    return {
        make: function (config) {
            return factory(config);
        }
    };
});
