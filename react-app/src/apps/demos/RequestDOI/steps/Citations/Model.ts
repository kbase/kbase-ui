import GenericClient from "lib/kb_lib/comm/JSONRPC11/GenericClient";
import { SDKBoolean } from "lib/kb_lib/comm/types";
import { Config } from "types/config";
import {
    ORCIDLinkServiceClient
} from "../../../../ORCIDLink/ORCIDLinkClient";
// import { CSLMetadata } from "./DOIOrgClient";
// import CitationsForm from "./demos/RequestDOI/steps/CitationsForm";


const START_LINKING_SESSION_PATH = 'start-linking-session';

// export interface CSLMetadataExtended {
//     metadata: CSLMetadata;
//     journalAbbreviation: string | null;
// }

// const GET_TEMP_LINK_RECORD_PATH = 'get-temp-link';

// export interface ORCIDAuth {
//     scope: string
//     orcid: string;
//     name: string;
//     expires_in: number;
// }

// export interface LinkRecord {
//     created_at: number,
//     orcid_auth: ORCIDAuth
// }

// export interface LinkResult {
//     link: LinkRecord | null;
// }

// export interface LinkingSessionInfo {
//     session_id: string;
//     created_at: number;
//     expires_at: number;
//     orcid_auth: ORCIDAuth;
// }


// export interface ReturnLink {
//     url: string;
//     label: string;
// }

// export type GetProfileResult = {
//     result: ORCIDProfile
// };



// export interface AppPublications {
//     id: string;
//     title: string;
//     publications: Array<{
//         text: string,
//         link: string,
//         doi: string | null
//     }>
// }


export type CitationSource = 'app' | 'markdown' | 'manual';


export type Citation = {
    citation: string,
    source: CitationSource,
    url?: string,
    doi?: string | null
}

export interface AppCitations {
    id: string;
    title: string;
    citations: Array<Citation>;
}

export interface NarrativeAppCitations {
    release: Array<AppCitations>;
    beta: Array<AppCitations>;
    dev: Array<AppCitations>;
}

export interface Citations {
    narrativeAppCitations: NarrativeAppCitations
    markdownCitations: Array<Citation>
    manualCitations: Array<Citation>
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

// MODEL

export class Model {
    config: Config;
    // auth: AuthenticationStateAuthenticated;
    orcidLinkClient: ORCIDLinkServiceClient;

    constructor({ config }: { config: Config }) {
        this.config = config;
        // this.auth = auth;
        this.orcidLinkClient = new ORCIDLinkServiceClient({
            isDynamicService: true,
            url: this.config.services.ServiceWizard.url,
            timeout: this.config.ui.constants.clientTimeout
        });
    }

    async serviceURL(): Promise<string> {
        const serviceWizard = new GenericClient({
            module: 'ServiceWizard',
            timeout: this.config.ui.constants.clientTimeout,
            url: this.config.services.ServiceWizard.url
        });
        const [result] = await serviceWizard.callFunc('get_service_status', [{
            module_name: 'ORCIDLink',
            version: 'dev'
        }]) as unknown as [GetServiceStatusResult];
        return result.url;
    }

    async getCitation(doi: string): Promise<string> {
        const result = await this.orcidLinkClient.getDOICitation(doi);
        return result.citation;
    }

    // async fetchNarratives({ from, to }: { from: number, to: number }): Promise<Array<NarrativeInfo>> {
    //     const client = new NarrativeService({
    //         url: this.config.services.ServiceWizard.url,
    //         timeout: 1000,
    //         token: this.auth.authInfo.token
    //     });
    //     const result = await client.list_narratives({ type: 'mine' })

    //     return result.narratives
    //         .map(({ nar, ws }) => {
    //             const objectInfo = objectInfoToObject(nar);
    //             const workspaceInfo = workspaceInfoToObject(ws);
    //             return { objectInfo, workspaceInfo };
    //         })
    //         .filter(({ objectInfo, workspaceInfo }) => {
    //             return (workspaceInfo.globalread === 'r');
    //         })
    //         .sort((a, b) => {
    //             return -(a.objectInfo.saveDate.localeCompare(b.objectInfo.saveDate));
    //         });
    // }

    // async fetchNarrative(workspaceId: number, objectId: number, version: number): Promise<NarrativeInfo> {
    //     const client = new Workspace({
    //         url: this.config.services.Workspace.url,
    //         timeout: 1000,
    //         token: this.auth.authInfo.token
    //     });
    //     const objectInfos = await client.get_object_info3({ objects: [{ objid: objectId, wsid: workspaceId, ver: version }] });
    //     const objectInfo = objectInfos.infos[0];
    //     const workspaceInfo = await client.get_workspace_info({ id: workspaceId });

    //     return {
    //         objectInfo, workspaceInfo
    //     };
    // }

    // async getName(): Promise<GetNameResult> {
    //     const { lastName, firstName } = await this.orcidLinkClient.getProfile();
    //     return { lastName, firstName };
    // }

    // async getNarrativeCitations(narrativeInfo: MinimalNarrativeInfo): Promise<Array<Citation>> {
    //     // get apps from narrative
    //     const client = new GenericClient({
    //         module: 'Workspace',
    //         url: this.config.services.Workspace.url,
    //         timeout: 1000,
    //         token: this.auth.authInfo.token
    //     });

    //     // Sorry, untyped for now...
    //     const [result] = await client.callFunc<JSONArrayOf<JSONObject>, JSONArrayOf<JSONObject>>('get_objects2', [
    //         {
    //             "objects": [
    //                 {
    //                     "ref": narrativeInfo.ref,
    //                     "included": [
    //                         "cells/[*]/cell_type",
    //                         "cells/[*]/metadata/kbase/appCell/app/id",
    //                         "cells/[*]/metadata/kbase/appCell/app/tag",
    //                         "cells/[*]/metadata/kbase/appCell/app/version",
    //                         "cells/[*]/metadata/kbase/appCell/app/gitCommitHash",
    //                         "cells/[*]/source"
    //                     ]
    //                 }
    //             ]

    //         }
    //     ]);

    //     const cells = (digJSON(result, ['data', 0, 'data', 'cells']) as Array<any>).map((cell) => {
    //         switch (cell['cell_type']) {
    //             case 'code':
    //                 if ('kbase' in cell['metadata']) {
    //                     if ('appCell' in cell['metadata']['kbase']) {
    //                         return {
    //                             type: 'app',
    //                             id: cell['metadata']['kbase']['appCell']['app']['id'],
    //                             tag: cell['metadata']['kbase']['appCell']['app']['tag'],
    //                             version: cell['metadata']['kbase']['appCell']['app']['version'],
    //                             gitCommitHash: cell['metadata']['kbase']['appCell']['app']['gitCommitHash']
    //                         }
    //                     }
    //                 } else {
    //                     return {
    //                         type: 'code',
    //                         content: cell['source']
    //                     }
    //                 }
    //                 break;
    //             case 'markdown':
    //                 return {
    //                     type: 'markdown',
    //                     content: cell['source']
    //                 }
    //         }
    //         return null;
    //     })
    //         .filter((cell) => {
    //             return cell !== null;
    //         }) as Array<Cell>;


    //     // Get app citations.


    //     /*
    //         Not sure this is worth it, but mirror the static narrative behavior.
    //         By the time the narrative is published, it is possible that a release or beta
    //         app will have been updated, so there is not a great reason to be precise about
    //         fetching by the tag, rather than the most released.
    //         Much better would be to be able to get method info via the git commit hash,
    //         or the actual version (if version bumps are really enforced, not sure about that)
    //     */
    //     // Get all the tags in all the app cells.
    //     // collect unique app ids across all app cells.

    //     const apps: Array<CellApp> = [];
    //     for (const cell of cells) {
    //         if (cell.type === 'app') {
    //             apps.push(cell);
    //         }
    //     }

    //     const tags = apps.reduce<{ [k: string]: Set<string> }>((tags, cell) => {
    //         if (cell.tag in tags) {
    //             tags[cell.tag].add(cell.id);
    //         } else {
    //             tags[cell.tag] = new Set();
    //             tags[cell.tag].add(cell.id);
    //         }
    //         return tags;
    //     }, {});

    //     const nms = new GenericClient({
    //         module: 'NarrativeMethodStore',
    //         url: this.config.services.NarrativeMethodStore.url,
    //         timeout: 1000,
    //         token: this.auth.authInfo.token
    //     });

    //     const narrativeAppCitations: NarrativeAppCitations = {
    //         release: [],
    //         beta: [],
    //         dev: []
    //     };


    //     const citations: Array<Citation> = [];
    //     const appTags = ['release', 'beta', 'dev'];
    //     for (const tag of appTags) {
    //         if (tag in tags) {

    //             const ids = Array.from(tags[tag]);
    //             const appsInfo = await nms.callFunc('get_method_full_info', [{
    //                 ids,
    //                 tag
    //             }]);
    //             const appPublications = (appsInfo[0] as unknown as JSONArray).forEach((appInfo) => {
    //                 if (!isJSONObject(appInfo)) {
    //                     throw new Error('Not an object');
    //                 }

    //                 const publications = appInfo['publications'];
    //                 if (publications instanceof Array) {
    //                     return publications.forEach((publication) => {
    //                         if (!isJSONObject(publication)) {
    //                             throw new Error('Publication not object!')
    //                         }
    //                         const { display_text: text, link } = publication;
    //                         const m = /doi:[\s]*([\S]+)/i.exec(text as string);
    //                         const doi = (() => {
    //                             if (m) {
    //                                 // Sometimes a DOI is followed by punctuation; strip it off.
    //                                 const fixed = /(.*?)[.,;:]*$/.exec(m[1]);
    //                                 if (fixed) {
    //                                     return fixed[1];
    //                                 }
    //                                 return m[1];
    //                             }
    //                             return undefined;
    //                         })();

    //                         citations.push({
    //                             citation: (text as unknown as string).trim(),
    //                             url: link as unknown as string,
    //                             doi,
    //                             source: 'app'
    //                         });
    //                     });
    //                     return [];
    //                 }
    //                 return {
    //                     id: appInfo['id'] as string,
    //                     title: appInfo['name'] as string,
    //                     citations
    //                 };
    //             });
    //             // narrativeAppCitations[tag] = appPublications;
    //         }
    //     }

    //     // extract dois from markdown cells

    //     // extract dois from app publications
    //     for (const cell of cells) {
    //         if (cell.type === 'markdown') {
    //             const markdownLines = (cell.content as string).split(/(?:(?:\n\n)|(?:  \n)|(?:\n\s*[-*]\s*))/)
    //                 .filter((line) => {
    //                     return (line.trim().length > 0);
    //                 });
    //             if (markdownLines.length === 0) {
    //                 continue;
    //             }
    //             if (markdownLines[0].match(/references/i)) {
    //                 markdownLines.slice(1).forEach((line) => {
    //                     // remove any leading - or * if a list.
    //                     const citation = (() => {
    //                         const m = line.match(/^\s*[-*]*\s*(.*)$/);
    //                         if (m) {
    //                             return m[m.length - 1]
    //                         }
    //                         return line;
    //                     })();
    //                     const doi = (() => {
    //                         const m = citation.match(/doi:\s*(\S+)/)
    //                         if (m) {
    //                             return m[1];
    //                         }
    //                         return null;
    //                     })();
    //                     citations.push({
    //                         citation,
    //                         doi,
    //                         source: 'markdown'
    //                     });
    //                 });
    //             }
    //         }
    //     }

    //     return citations;
    // }



    // async getDOICitation(doi: string) {
    //     return this.orcidLinkClient.getDOICitation(doi);
    // }

    // async getJournalAbbreviation(title: string) {
    //     const abbreviations = await this.orcidLinkClient.getJournalAbbreviation(title);

    //     // Now just get the shortest abbreviation. Yes, there are sometimes cases
    //     // where one journal has multiple abbreviations, and I don't know of any
    //     // honest heuristic for determining the correct one, so for the sake of
    //     // brevity, we pick the first one.
    //     let shortest = null;
    //     for (const { abbreviation } of abbreviations) {
    //         if (shortest === null) {
    //             shortest = abbreviation;
    //         } else {
    //             if (abbreviation.length < shortest.length) {
    //                 shortest = abbreviation;
    //             }
    //         }
    //     }
    //     return shortest;
    // }

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
}
