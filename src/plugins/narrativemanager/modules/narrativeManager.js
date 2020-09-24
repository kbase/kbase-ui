define([
    'kb_lib/workspaceUtils',
    'kb_lib/jsonRpc/genericClient',
    'kb_lib/jsonRpc/dynamicServiceClient'
], function (
    wsUtils,
    GenericClient,
    DynamicServiceClient
) {

    class NarrativeManager {
        constructor({ runtime }) {
            this.runtime = runtime;
        }

        getMostRecentNarrative() {
            const workspaceClient = new GenericClient({
                module: 'Workspace',
                url: this.runtime.config('services.workspace.url'),
                token: this.runtime.service('session').getAuthToken()
            });
            // get the full list of workspaces
            return workspaceClient.callFunc('list_workspace_info', [{
                owners: [this.runtime.service('session').getUsername()]
            }])
                .then(function ([wsList]) {
                    const workspaces = wsList
                        .map(function (workspaceInfo) {
                            return wsUtils.workspaceInfoToObject(workspaceInfo);
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
                    const workspaceInfo = workspaces[0],
                        ref = [workspaceInfo.id, workspaceInfo.metadata.narrative].join('/');

                    return workspaceClient.callFunc('get_object_info_new', [{
                        objects: [{ ref: ref }],
                        includeMetadata: 1,
                        ignoreErrors: 1
                    }])
                        .then(function ([objList]) {
                            return ({
                                workspaceInfo: workspaceInfo,
                                narrativeInfo: wsUtils.objectInfoToObject(objList[0])
                            });
                        });
                });
        }

        createTempNarrative(params) {
            const narrativeService = new DynamicServiceClient({
                module: 'NarrativeService',
                url: this.runtime.config('services.service_wizard.url'),
                token: this.runtime.service('session').getAuthToken()
            });
            params.includeIntroCell = 1;
            // return new Promise((resolve, reject) => {
            //     reject(new Error('Yikes!'));
            // });
            return narrativeService
                .callFunc('create_new_narrative', [params])
                .then(([result]) => {
                    return result;
                });
        }
    }

    return NarrativeManager;
});
