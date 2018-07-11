define([
    'bluebird',
    'kb_service/utils',
    'kb_common/jsonRpc/genericClient',
    'kb_common/jsonRpc/dynamicServiceClient'
], function (
    Promise,
    serviceUtils,
    GenericClient,
    DynamicServiceClient
) {
    'use strict';

    function factory(config) {
        var runtime = config.runtime,
            workspaceClient = new GenericClient({
                module: 'Workspace',
                url: runtime.config('services.workspace.url'),
                token: runtime.service('session').getAuthToken()
            }),
            narrativeService = new DynamicServiceClient({
                module: 'NarrativeService',
                url: runtime.config('services.service_wizard.url'),
                token: runtime.service('session').getAuthToken()
            });

        function getMostRecentNarrative() {
            // get the full list of workspaces
            return workspaceClient.callFunc('list_workspace_info', [{
                owners: [runtime.service('session').getUsername()]
            }])
                .spread(function (wsList) {
                    var workspaces = wsList
                        .map(function (workspaceInfo) {
                            return serviceUtils.workspaceInfoToObject(workspaceInfo);
                        })
                        .filter(function (workspaceInfo) {
                            if (workspaceInfo.metadata && workspaceInfo.metadata.narrative) {
                                return true;
                            }
                            return false;
                        });

                    if (workspaces.length === 0) {
                        return null;
                    }

                    workspaces.sort(function (a, b) {
                        if (a.moddate > b.moddate) {
                            return -1;
                        }
                        if (a.moddate < b.moddate) {
                            return 1;
                        }
                        return 0;
                    });
                    var workspaceInfo = workspaces[0],
                        ref = [workspaceInfo.id, workspaceInfo.metadata.narrative].join('/');

                    return workspaceClient.callFunc('get_object_info_new', [{
                        objects: [{ ref: ref }],
                        includeMetadata: 1,
                        ignoreErrors: 1
                    }])
                        .spread(function (objList) {
                            return ({
                                workspaceInfo: workspaceInfo,
                                narrativeInfo: serviceUtils.objectInfoToObject(objList[0])
                            });
                        });
                });
        }

        function createTempNarrative(params) {
            params.includeIntroCell = 1;
            return narrativeService
                .callFunc('create_new_narrative', [params])
                .then(function (result) {
                    return Promise.try(function () {
                        return result[0];
                    });
                });
        }

        return {
            createTempNarrative: createTempNarrative,
            getMostRecentNarrative: getMostRecentNarrative
        };
    }

    // simple factory pattern.
    return factory;
});
