import {
    AdminGetDOIRequestsResult,
    DOIForm, DOIFormUpdate, GetNameResult, InitialDOIForm,
    NarrativeInfo, ORCIDLinkServiceClient, ORCIDProfile, OSTISubmission
} from "apps/ORCIDLink/ORCIDLinkClient";
import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { GetStaticNarrativeInfoParams, StaticNarrative } from "lib/clients/StaticNarrative";
import { digJSON, isJSONObject, JSONArray, JSONArrayOf, JSONObject } from "lib/json";
import UserProfileClient, { UserProfile } from "lib/kb_lib/comm/coreServices/UserProfile";
import Workspace, { ObjectInfo, ObjectSpecification, UserPerm, WorkspaceIdentity, WorkspaceInfo } from "lib/kb_lib/comm/coreServices/Workspace";
import GenericClient from "lib/kb_lib/comm/JSONRPC11/GenericClient";
import { SDKBoolean } from "lib/kb_lib/comm/types";
import { Config } from "types/config";
import { isNotNull } from "./common";



const START_LINKING_SESSION_PATH = 'start-linking-session';

// const GET_TEMP_LINK_RECORD_PATH = 'get-temp-link';

export interface ORCIDAuth {
    scope: string
    orcid: string;
    name: string;
    expires_in: number;
}

export interface LinkRecord {
    created_at: number,
    orcid_auth: ORCIDAuth
}

export interface LinkResult {
    link: LinkRecord | null;
}

export interface LinkingSessionInfo {
    session_id: string;
    created_at: number;
    expires_at: number;
    orcid_auth: ORCIDAuth;
}


export interface ReturnLink {
    url: string;
    label: string;
}

export type GetProfileResult = {
    result: ORCIDProfile
};


export interface CellBase {
    type: 'markdown' | 'app' | 'code'
}

export interface CellMarkdown {
    type: 'markdown',
    content: string
}

export interface CellCode {
    type: 'code',
    content: string
}

export interface CellApp {
    type: 'app',
    id: string,
    tag: string,
    version: string,
    gitCommitHash: string
}

export type Cell =
    CellMarkdown |
    CellApp |
    CellCode;

export interface AppPublications {
    id: string;
    title: string;
    publications: Array<{
        text: string,
        link: string,
        doi: string | null
    }>
}


export type CitationSource = 'app' | 'markdown' | 'manual';


export type ImportableCitation = {
    citation: string,
    source: CitationSource,
    url?: string,
    doi?: string | null
}

export interface AppCitations {
    id: string;
    title: string;
    citations: Array<ImportableCitation>;
}

export interface NarrativeAppCitations {
    release: Array<AppCitations>;
    beta: Array<AppCitations>;
    dev: Array<AppCitations>;
}

export interface Citations {
    narrativeAppCitations: NarrativeAppCitations
    markdownCitations: Array<ImportableCitation>
    manualCitations: Array<ImportableCitation>
}



// This is why having canned clients, even if relatively simply wrappers around
// GenericClient, is so nice:
export type AppTag = 'dev' | 'beta' | 'release';
export interface GetServiceStatusResult {
    git_commit_hash: string;
    status: string;
    version: string;
    hash: string;
    release_tags: Array<AppTag>
    url: string;
    module_name: string;
    health: string;
    up: SDKBoolean;
}

export interface ORCIDLinkInfo {
    createdAt: number;
    expiresAt: number;
    realname: string;
    orcidID: string;
    scope: string;
}


export interface JournalAbbreviationsMap {
    [title: string]: Array<string>
}


// Get Narrative Sharing

export type NarrativePermission = 'none' | 'view' | 'edit' | 'admin' | 'owner';

export interface NarrativeShareUser {
    username: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    institution?: string;
    permission: NarrativePermission
    userProfile: UserProfile
}

// Narratives

export interface StaticNarrativeSummary {
    title: string;
    workspaceId: number;
    objectId: number;
    version: number;
    ref: string;
    staticNarrativeSavedAt: number
    narrativeSavedAt: number;
    owner: string;
}

// MODEL

export class Model {
    config: Config;
    auth: AuthenticationStateAuthenticated;
    orcidLinkClient: ORCIDLinkServiceClient;

    constructor({ config, auth }: { config: Config, auth: AuthenticationStateAuthenticated }) {
        this.config = config;
        this.auth = auth;
        this.orcidLinkClient = new ORCIDLinkServiceClient({
            isDynamicService: true,
            url: this.config.services.ServiceWizard.url,
            timeout: 1000,
            token: auth.authInfo.token
        });
    }


    async serviceURL(): Promise<string> {
        const serviceWizard = new GenericClient({
            module: 'ServiceWizard',
            timeout: 1000,
            url: this.config.services.ServiceWizard.url
        });
        const [result] = await serviceWizard.callFunc('get_service_status', [{
            module_name: 'ORCIDLink',
            version: 'dev'
        }]) as unknown as [GetServiceStatusResult];
        return result.url;
    }

    async getProfile(): Promise<ORCIDProfile> {
        return this.orcidLinkClient.getProfile();
    }

    async isLinked(): Promise<boolean> {
        return this.orcidLinkClient.isLinked();
    }

    async getLink(): Promise<LinkRecord | null> {
        return this.orcidLinkClient.getLink();
    }

    async fetchNarratives(): Promise<Array<StaticNarrativeSummary>> {
        const staticNarrativesService = new StaticNarrative({
            url: this.config.services.ServiceWizard.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        })
        const workspaceClient = new Workspace({
            url: this.config.services.Workspace.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        })
        // const narrativeServiceClient = new NarrativeService({
        //     url: this.config.services.ServiceWizard.url,
        //     timeout: 1000,
        //     token: this.auth.authInfo.token
        // });
        const staticNarrativeList = await staticNarrativesService.list_static_narratives();

        // THe api only returns the most recent static narrative, so we just extract the workspce ids 
        // (which unfortunately are returned as strings from list_static_narratives).
        const staticNarrativesToGet: Array<GetStaticNarrativeInfoParams> = Object.keys(staticNarrativeList).map((workspaceId) => {
            return {
                ws_id: parseInt(workspaceId)!
            }
        });

        // Object.entries(staticNarrativeList).forEach(([workspaceId, versions]) => {
        //     versions.forEach(({ ws_id, narrative_version, url }) => {
        //         staticNarrativesToGet.push({
        //             ws_id: parseInt(ws_id)!, narrative_version: parseInt(narrative_version)!
        //         })
        //     })
        // })

        const staticNarratives0 = await Promise.all(staticNarrativesToGet.map(async (param) => {
            try {
                return await staticNarrativesService.get_static_narrative_info(param);
            } catch (ex) {
                // TODO: detect if this is a permissions error
                // that _should_ never happen, but does if a narrative is made private
                // after it is published!
                return null;
            }
        }));

        const staticNarratives = staticNarratives0.filter(isNotNull);

        // TODO: refactor to use filter or filter ish.
        // NB .filter itself does not currently do type narrowing, need to explore
        // const staticNarratives: Array<StaticNarrativeInfo> = [];
        // for (const staticNarrative of staticNarratives0) {
        //     if (staticNarrative !== null) {
        //         staticNarratives.push(staticNarrative);
        //     }
        // }

        const narrativesToGet: Array<ObjectSpecification> = staticNarratives.map(({ ws_id, version, narrative_id }) => {
            return {
                wsid: ws_id, objid: narrative_id, ver: version
            };
        });

        const workspaceNumbersToGet: Set<number> = new Set();
        staticNarratives.forEach(({ ws_id }) => {
            workspaceNumbersToGet.add(ws_id as number);
        });

        const workspacesToGet: Array<WorkspaceIdentity> = Array.from(workspaceNumbersToGet.values()).map((id) => {
            return { id }
        });

        const narrativeInfos = await workspaceClient.get_object_info3({ objects: narrativesToGet, includeMetadata: 1, ignoreErrors: 1 });

        const workspaceInfos = (await Promise.all((workspacesToGet).map((wsIdentity) => {
            try {
                return workspaceClient.get_workspace_info(wsIdentity);
            } catch (ex) {
                return null;
            }
        }))).filter(isNotNull);

        const allPermissions = await workspaceClient.get_permissions_mass({
            workspaces: workspaceInfos.map(({ id }) => {
                return { id }
            })
        });

        const workspacesMap: Map<number, { info: WorkspaceInfo, permissions: UserPerm }> = workspaceInfos
            .reduce((workspacesMap, workspaceInfo, index) => {
                const permissions = allPermissions.perms[index];
                workspacesMap.set(workspaceInfo.id, {
                    info: workspaceInfo,
                    permissions
                });
                return workspacesMap;
            }, new Map());


        const staticNarrativeSummary: Array<StaticNarrativeSummary> = staticNarratives
            .filter(({ ws_id }, index) => {
                const workspace = workspacesMap.get(ws_id)!;
                const username = this.auth.authInfo.account.user;

                // Just owner
                // return workspace.info.owner === this.auth.authInfo.account.user;

                // Any admin
                return username in workspace.permissions && ['a', 'w'].includes(workspace.permissions[username]);
            })
            .map(({ ws_id, narrative_id, version, narr_saved, static_saved }, index) => {
                const narrativeInfo: ObjectInfo = narrativeInfos.infos[index];

                if (narrativeInfo === null) {
                    return null;
                }

                const workspace = workspacesMap.get(ws_id)!;

                return {
                    workspaceId: ws_id, objectId: narrative_id, version,
                    ref: `${ws_id}/${narrative_id}/${version}`,
                    title: workspace.info.metadata['narrative_nice_name'],
                    narrativeSavedAt: narr_saved, staticNarrativeSavedAt: static_saved,
                    owner: workspace.info.owner
                };
            })
            .filter(isNotNull);

        return staticNarrativeSummary;
        // NB above. TS is not smart enough to determine that the test for item being null excludes that
        // type from the result.


        // return result.narratives
        //     .map(({ nar, ws }) => {
        //         const objectInfo = objectInfoToObject(nar);
        //         const workspaceInfo = workspaceInfoToObject(ws);
        //         return { objectInfo, workspaceInfo };
        //     })
        //     .filter(({ objectInfo, workspaceInfo }) => {
        //         return (workspaceInfo.globalread === 'r');
        //     })
        //     .sort((a, b) => {
        //         return -(a.objectInfo.saveDate.localeCompare(b.objectInfo.saveDate));
        //     });
    }

    async fetchNarrative(workspaceId: number, objectId: number, version: number): Promise<NarrativeInfo> {
        const client = new Workspace({
            url: this.config.services.Workspace.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        });
        const objectInfos = await client.get_object_info3({ objects: [{ objid: objectId, wsid: workspaceId, ver: version }] });
        const objectInfo = objectInfos.infos[0];
        const workspaceInfo = await client.get_workspace_info({ id: workspaceId });

        return {
            objectInfo, workspaceInfo
        };
    }

    async getName(): Promise<GetNameResult> {
        const { lastName, firstName } = await this.orcidLinkClient.getProfile();
        return { lastName, firstName };
    }

    async getNarrativeCitations(staticNarrative: StaticNarrativeSummary): Promise<Array<ImportableCitation>> {
        // get apps from narrative
        const client = new GenericClient({
            module: 'Workspace',
            url: this.config.services.Workspace.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        });

        // Sorry, untyped for now...
        const [result] = await client.callFunc<JSONArrayOf<JSONObject>, JSONArrayOf<JSONObject>>('get_objects2', [
            {
                "objects": [
                    {
                        "ref": staticNarrative.ref,
                        "included": [
                            "cells/[*]/cell_type",
                            "cells/[*]/metadata/kbase/appCell/app/id",
                            "cells/[*]/metadata/kbase/appCell/app/tag",
                            "cells/[*]/metadata/kbase/appCell/app/version",
                            "cells/[*]/metadata/kbase/appCell/app/gitCommitHash",
                            "cells/[*]/source"
                        ]
                    }
                ]

            }
        ]);

        const cells = (digJSON(result, ['data', 0, 'data', 'cells']) as Array<any>).map((cell) => {
            switch (cell['cell_type']) {
                case 'code':
                    if ('kbase' in cell['metadata']) {
                        if ('appCell' in cell['metadata']['kbase']) {
                            return {
                                type: 'app',
                                id: cell['metadata']['kbase']['appCell']['app']['id'],
                                tag: cell['metadata']['kbase']['appCell']['app']['tag'],
                                version: cell['metadata']['kbase']['appCell']['app']['version'],
                                gitCommitHash: cell['metadata']['kbase']['appCell']['app']['gitCommitHash']
                            }
                        }
                    } else {
                        return {
                            type: 'code',
                            content: cell['source']
                        }
                    }
                    break;
                case 'markdown':
                    return {
                        type: 'markdown',
                        content: cell['source']
                    }
            }
            return null;
        })
            .filter((cell) => {
                return cell !== null;
            }) as Array<Cell>;


        // Get app citations.


        /*
            Not sure this is worth it, but mirror the static narrative behavior.
            By the time the narrative is published, it is possible that a release or beta
            app will have been updated, so there is not a great reason to be precise about
            fetching by the tag, rather than the most released.
            Much better would be to be able to get method info via the git commit hash,
            or the actual version (if version bumps are really enforced, not sure about that)
        */
        // Get all the tags in all the app cells.
        // collect unique app ids across all app cells.

        const apps: Array<CellApp> = [];
        for (const cell of cells) {
            if (cell.type === 'app') {
                apps.push(cell);
            }
        }

        const tags = apps.reduce<{ [k: string]: Set<string> }>((tags, cell) => {
            if (cell.tag in tags) {
                tags[cell.tag].add(cell.id);
            } else {
                tags[cell.tag] = new Set();
                tags[cell.tag].add(cell.id);
            }
            return tags;
        }, {});

        const nms = new GenericClient({
            module: 'NarrativeMethodStore',
            url: this.config.services.NarrativeMethodStore.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        });

        const narrativeAppCitations: NarrativeAppCitations = {
            release: [],
            beta: [],
            dev: []
        };


        const citations: Array<ImportableCitation> = [];
        const appTags = ['release', 'beta', 'dev'];
        for (const tag of appTags) {
            if (tag in tags) {

                const ids = Array.from(tags[tag]);
                const appsInfo = await nms.callFunc('get_method_full_info', [{
                    ids,
                    tag
                }]);
                const appPublications = (appsInfo[0] as unknown as JSONArray).forEach((appInfo) => {
                    if (!isJSONObject(appInfo)) {
                        throw new Error('Not an object');
                    }

                    const publications = appInfo['publications'];
                    if (publications instanceof Array) {
                        return publications.forEach((publication) => {
                            if (!isJSONObject(publication)) {
                                throw new Error('Publication not object!')
                            }
                            const { display_text: text, link } = publication;
                            const m = /doi:[\s]*([\S]+)/i.exec(text as string);
                            const doi = (() => {
                                if (m) {
                                    // Sometimes a DOI is followed by punctuation; strip it off.
                                    const fixed = /(.*?)[.,;:]*$/.exec(m[1]);
                                    if (fixed) {
                                        return fixed[1];
                                    }
                                    return m[1];
                                }
                                return undefined;
                            })();

                            citations.push({
                                citation: (text as unknown as string).trim(),
                                url: link as unknown as string,
                                doi,
                                source: 'app'
                            });
                        });
                        return [];
                    }
                    return {
                        id: appInfo['id'] as string,
                        title: appInfo['name'] as string,
                        citations
                    };
                });
                // narrativeAppCitations[tag] = appPublications;
            }
        }

        // extract dois from markdown cells

        // extract dois from app publications
        for (const cell of cells) {
            if (cell.type === 'markdown') {
                const markdownLines = (cell.content as string).split(/(?:(?:\n\n)|(?:  \n)|(?:\n\s*[-*]\s*))/)
                    .filter((line) => {
                        return (line.trim().length > 0);
                    });
                if (markdownLines.length === 0) {
                    continue;
                }
                if (markdownLines[0].match(/references/i)) {
                    markdownLines.slice(1).forEach((line) => {
                        // remove any leading - or * if a list.
                        const citation = (() => {
                            const m = line.match(/^\s*[-*]*\s*(.*)$/);
                            if (m) {
                                return m[m.length - 1]
                            }
                            return line;
                        })();
                        const doi = (() => {
                            const m = citation.match(/doi:\s*(\S+)/)
                            if (m) {
                                return m[1];
                            }
                            return null;
                        })();
                        citations.push({
                            citation,
                            doi,
                            source: 'markdown'
                        });
                    });
                }
            }
        }

        return citations;
    }


    async createDOIForm(doiForm: InitialDOIForm): Promise<DOIForm> {
        return this.orcidLinkClient.createDOIApplication(doiForm);
    }

    async saveDOIForm(doiForm: DOIFormUpdate): Promise<DOIForm> {
        return this.orcidLinkClient.saveDOIApplication(doiForm);
    }

    async getDOIForm(formId: string): Promise<DOIForm> {
        return this.orcidLinkClient.getDOIApplication(formId);
    }

    async deleteDOIForm(formId: string): Promise<void> {
        return this.orcidLinkClient.deleteDOIApplication(formId);
    }

    async getDOIForms(): Promise<Array<DOIForm>> {
        return this.orcidLinkClient.getDOIApplications();
    }

    async fetchLinkingSessionInfo(sessionId: string) {
        return this.orcidLinkClient.getLinkingSession(sessionId);
    }

    async getDOIApplicationsAdmin(): Promise<Array<DOIForm>> {
        return this.orcidLinkClient.adminGetDOIApplications();
    }

    async getDOIRequestsAdmin(): Promise<Array<AdminGetDOIRequestsResult>> {
        return this.orcidLinkClient.adminGetDOIRequests();
    }

    // async getDOIMetadata(doi: string) {
    //     return this.orcidLinkClient.getDOIMetadata(doi);
    // }

    async getDOICitation(doi: string) {
        return this.orcidLinkClient.getDOICitation(doi);
    }

    async getNarrativeSharingUsers({ workspaceId, owner }: StaticNarrativeSummary): Promise<Array<NarrativeShareUser>> {
        const client = new Workspace({
            url: this.config.services.Workspace.url,
            timeout: 1000,
            token: this.auth.authInfo.token
        });
        const { perms: [permissions] } = await client.get_permissions_mass({ workspaces: [{ id: workspaceId }] });

        const usernames = Object.entries(permissions)
            .map(([username, permission]) => {
                return { username, permission };
            })
            .filter(({ username }) => {
                return username !== '*';
            });

        const userProfileService = new UserProfileClient({
            url: this.config.services.UserProfile.url,
            timeout: 1000
        });
        const userProfiles = await userProfileService.get_user_profile(usernames.map(({ username }) => username));

        const sharingUsers: Array<NarrativeShareUser> = usernames.map(({ username, permission }, index) => {
            // const { user: { realname }, profile: { userdata: { organization } } } = userProfiles[index];
            const userProfile = userProfiles[index];
            const [firstName, middleName, lastName] = (() => {
                const match = /^(\S+) (?:(.+) )?(?:(\S+)(?:\s*))$/.exec(userProfile.user.realname);
                if (match === null) {
                    return ['', '', ''];
                }
                return match.slice(1);
            })();
            const permissionLabel = (() => {
                if (username === owner) {
                    return 'owner';
                }
                switch (permission) {
                    case 'r': return 'view';
                    case 'w': return 'edit';
                    case 'a': return 'admin';
                    case 'n': return 'none';
                }
            })();
            return {
                username,
                firstName, middleName, lastName,
                institution: userProfile.profile.userdata.organization,
                permission: permissionLabel,
                userProfile
            };
        });

        return sharingUsers;
    }

    // async getJournalAbbreviations(citations: Array<CSLMetadata>) {
    //     const journalTitles: Array<string> = citations
    //         .map(({ 'container-title': containerTitle }) => {
    //             return containerTitle.at(-1);
    //         })
    //         .filter((journal) => {
    //             return typeof journal !== 'undefined';
    //         }) as unknown as Array<string>;

    //     const abbreviations = await this.orcidLinkClient.getJournalAbbreviations(journalTitles);

    //     // Now join them together, or make a map and pass it?
    //     const journalAbbreviations: JournalAbbreviationsMap = abbreviations.reduce<JournalAbbreviationsMap>((journalAbbreviations, { title, abbreviation }) => {
    //         if (title in journalAbbreviations) {
    //             journalAbbreviations[title].push(abbreviation);
    //         } else {
    //             journalAbbreviations[title] = [abbreviation];
    //         }
    //         return journalAbbreviations;
    //     }, {});
    // }

    async submitDOIRequest(form_id: string, submission: OSTISubmission) {
        const result = await this.orcidLinkClient.submitDOIRequest({ form_id, submission });
        return result;
    }
}
