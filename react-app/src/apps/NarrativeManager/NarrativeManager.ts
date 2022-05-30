import { AuthInfo } from "../../contexts/Auth";
import { CreateNewNarrativeParams, NarrativeService } from "../../lib/clients/NarrativeService";
import Workspace from "../../lib/kb_lib/comm/coreServices/Workspace";
import { Config } from "../../types/config";

export default interface NarrativeManagerParams {
    config: Config;
    auth: AuthInfo;
}

export class NarrativeManager {
    config: Config;
    auth: AuthInfo
        constructor({config, auth}: NarrativeManagerParams) {
            this.config = config;
            this.auth = auth;
        }

        async getMostRecentNarrative() {
            const workspaceClient = new Workspace({
                url: this.config.services.Workspace.url,
                timeout: 1000,
                token: this.auth.token
            });
            // get the full list of workspaces
            const workspaceInfos = await workspaceClient.list_workspace_info({
                owners: [this.auth.account.user],
            });

            const workspaces = workspaceInfos
                .filter((workspaceInfo) => {
                    // TODO: should be function in json.ts for this...
                    return !!(
                        'metadata' in workspaceInfo && 
                        typeof workspaceInfo.metadata === 'object' && 
                        workspaceInfo.metadata !== null && 
                        'narrative' in workspaceInfo.metadata
                    );
                });

            if (workspaces.length === 0) {
                return null;
            }

            workspaces.sort((a, b) => {
                if (a.moddate! > b.moddate!) {
                    return -1;
                }
                if (a.moddate! < b.moddate!) {
                    return 1;
                }
                return 0;
            });
            const workspaceInfo = workspaces[0],
                ref = [workspaceInfo.id, workspaceInfo.metadata.narrative].join('/');

            const {infos} = await workspaceClient.get_object_info3({
                objects: [{ref: ref}],
                includeMetadata: 1,
                ignoreErrors: 1,
            });
            return ({
                workspaceInfo: workspaceInfo,
                narrativeInfo: infos[0]
            });
        }

        createTempNarrative(params: CreateNewNarrativeParams) {
            const narrativeService = new NarrativeService({
                url: this.config.services.ServiceWizard.url,
                token: this.auth.token,
                timeout: 1000
            });
            params.includeIntroCell = 1;
            // return new Promise((resolve, reject) => {
            //     reject(new Error('Yikes!'));
            // });
            return narrativeService.create_new_narrative(params);
        }
    }
