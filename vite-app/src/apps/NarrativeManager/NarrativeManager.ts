import { AuthInfo } from "contexts/EuropaContext";
import { CreateNewNarrativeParams, NarrativeService } from "../../lib/clients/NarrativeService";
import Workspace, { objectInfoToObject, workspaceInfoToObject } from "../../lib/kb_lib/comm/coreServices/Workspace";
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
                timeout: this.config.ui.constants.clientTimeout,
                token: this.auth.token
            });
            // get the full list of workspaces
            const workspaceInfos = await workspaceClient.list_workspace_info({
                owners: [this.auth.account.user],
            });

            const workspaces = workspaceInfos
                .map((workspaceInfo) => {
                    return workspaceInfoToObject(workspaceInfo);
                })
                .filter((workspaceInfo) => {
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
                narrativeInfo: objectInfoToObject(infos[0])
            });
        }

        createTempNarrative(params: CreateNewNarrativeParams) {
            const narrativeService = new NarrativeService({
                url: this.config.services.ServiceWizard.url,
                token: this.auth.token,
                timeout: this.config.ui.constants.clientTimeout
            });
            params.includeIntroCell = 1;
            return narrativeService.create_new_narrative(params);
        }
    }
