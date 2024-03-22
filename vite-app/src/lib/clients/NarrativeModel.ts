/* eslint-disable camelcase */
import { JSONObject } from "lib/json";
import WorkspaceClient from "lib/kb_lib/comm/coreServices/Workspace";

/**
 * Interfaces that represent Narrative data returned from the search service.
 */

/**
 * The Cell is the unitary piece of a Narrative where info gets stored and apps get run.
 */
export interface NarrativeDocCell {
    cell_type: string;
    desc: string;
    count?: number;
}

export interface DataObject {
    name: string;
    obj_type: string;
    readableType: string;
}

/**
 * A Doc is composed of an Array of Cells and a bunch of extra info and data.
 * This pretty closely matches what's returned from Search.
 */
export interface NarrativeSearchDoc {
    access_group: number;
    cells: Array<NarrativeDocCell>;
    copied: boolean | null;
    creation_date: string;
    creator: string;
    data_objects: Array<DataObject>;
    index_runner_ver: string;
    is_narratorial: boolean;
    is_public: boolean;
    modified_at: number;
    narrative_title: string;
    obj_id: number;
    obj_name: string;
    obj_type: string;
    obj_type_module: string;
    obj_type_name: string;
    obj_type_version: string;
    owner: string;
    shared_users: Array<string>;
    tags: Array<string>;
    timestamp: number;
    total_cells: number;
    version: number;
}

export type CellType = "code" | "markdown";

export type KBaseCodeCellType = "code" | "data" | "app" | "output" | "serviceWidget" ;

export interface BaseCell {
    cell_type: CellType;
    metadata: {
        kbase: {
            attributes?: {
                title: string;
                subtitle?: string;
            };
        };
    };
}

export interface MarkdownCell extends BaseCell {
    cell_type: "markdown";
    source: string;
}

export interface CodeCellBase extends BaseCell {
    cell_type: "code";
    execution_count: number;
    metadata: {
        kbase: {
            type: KBaseCodeCellType;
            attributes?: {
                title: string;
            };
        };
    };
    source: string;
}

export type GenericParams = { [key: string]: number | string };

export interface AppCell extends CodeCellBase {
    metadata: {
        kbase: {
            type: "app";
            attributes: {
                title: string;
            };
            appCell: {
                app: {
                    id: string;
                    tag: string;
                    version: string;
                    gitCommitHash: string;
                    exec: {
                        jobState: {
                            status: string;
                        };
                    };
                    spec: {
                        full_info: {
                            module_name: string;
                            authors: Array<string>;
                            name: string;
                            description: string;
                            title: string;
                            subtitle: string;
                            ver: string;
                            icon: {
                                url: string;
                            };
                        };
                        info: {
                            app_type: string;
                            authors: Array<string>;
                            categories: Array<string>;
                            git_commit_hash: string;
                            icon: {
                                url: string;
                            };
                            id: string;
                            input_types: Array<string>;
                            module_name: string;
                            name: string;
                            namespace: string;
                            output_types: Array<string>;
                            subtitle: string;
                            tooltip: string;
                            ver: string;
                        };
                    };
                };
                params: GenericParams;
                exec: {
                    jobState: {
                        run_id: string;
                        authstrat: string;
                        batch_id: null | string;
                        batch_job: boolean;
                        cell_id: string;
                        child_jobs: Array<any>;
                        status: string;
                        created: number;
                        queued: number;
                        running: number;
                        finished: number;
                        updated: number;
                        job_id: string;
                        job_output: {
                            id: string;
                            result: any;
                            version: number;
                        };
                        scheduler_id: string;
                        scheduler_type: string;
                        user: string;
                        wsid: number;
                    };
                };
            };
        };
    };
}

export interface CodeCell extends CodeCellBase {
    metadata: {
        kbase: {
            type: "code";
            attributes?: {
                title: string;
            };
            outputCell: {
                jobId: string;
                parentCellId: string;
                widget: {
                    name: string;
                    params: JSONObject;
                    tag: string;
                };
            };
            codeCell: {
                userSettings: {
                    showCodeInputArea: boolean;
                };
            };
        };
    };
}

export interface DataObjectCell extends CodeCellBase {
    metadata: {
        kbase: {
            type: "data";
            attributes: {
                title: string;
            };
            dataCell: {
                objectInfo: {
                    name: string;
                    obj_id: string;
                    ref: string;
                    ref_path: string | null;
                    id: number;
                    checksum: string;
                    version: number;
                    saveDate: string;
                    save_date: string;
                    saved_by: string;
                    size: number;
                    type: string;
                    typeModule: string;
                    typeName: string;
                    typeMajorVersion: string;
                    typeMinorVersion: string;
                    ws: string;
                    ws_id: number;
                    wsid: number;
                };
            };
        };
    };
}

export interface OutputObjectCell extends CodeCellBase {
    metadata: {
        kbase: {
            type: "output";
            attributes: {
                title: string;
            };
            outputCell: {
                jobId: string;
                parentCellId: string;
                widget: {
                    name: string;
                    params: JSONObject;
                    tag: string;
                };
            };
        };
    };
}


export interface ServiceWidgetCell extends CodeCellBase {
    metadata: {
        kbase: {
            type: "serviceWidget";
            attributes: {
                title: string;
                subtitle: string;
                // TODO: icon here
            };
            serviceWidget: {
                service: {
                    moduleName: string;
                    widgetName: string;
                    title: string;
                    subtitle: string;
                    params: Record<string, any>;
                    isDynamicService: boolean;
                }
            };
        };
    };
}

export type SomeCodeCell =
    | CodeCell
    | AppCell
    | DataObjectCell
    | OutputObjectCell 
    | ServiceWidgetCell;

export type Cell = MarkdownCell | SomeCodeCell;
// | AppCell
// | CodeCell
// | DataObjectCell
// | OutputObjectCell;

// export interface Cell {
//     cell_type: string;
//     metadata: {
//         kbase: {
//             attributes: {
//                 title: string;
//                 subtitle?: string;
//             };
//             type: string;
//         };
//     };
// }

export interface NarrativeMetadata {
    description: string;
    data_dependencies: Array<string>;
    creator: string;
    format: string;
    name: string;
    type: string;
    ws_name: string;
}

/* Narrative object */
// TODO
export interface NarrativeObject {
    nbformat: number;
    nbformat_minor: number;
    cells: Array<Cell>;
    metadata: NarrativeMetadata;
}

const narrativeObjectCache: Map<string, NarrativeObject> = new Map();

export default class NarrativeModel {
    workspaceURL: string;
    token: string;
    timeout: number;
    // authInfo: AuthInfo;
    // config: Config;
    constructor({
        workspaceURL,
        token,
        timeout,
    }: {
        workspaceURL: string;
        token: string;
        timeout: number;
    }) {
        this.workspaceURL = workspaceURL;
        this.token = token;
        this.timeout = timeout;
    }

    clearCache() {
        narrativeObjectCache.clear();
    }

    async fetchNarrative(upa: string): Promise<NarrativeObject> {
        if (narrativeObjectCache.has(upa)) {
            return narrativeObjectCache.get(upa)!;
        }
        // const client = new GenericClient({
        //   module: "Workspace",
        //   url: this.workspaceURL,
        //   token: this.token,
        //   timeout: 1000,
        // });

        const ws = new WorkspaceClient({
            url: this.workspaceURL,
            timeout: this.timeout,
            token: this.token
        });

        // const [result] = await client.callFunc("get_objects2", [
        //   { objects: [{ ref: upa }] },
        // ]);

        const result = await ws.get_objects2(
            { objects: [{ ref: upa }] },
        );
        const narrativeObject = result.data[0].data as unknown as NarrativeObject;
        narrativeObjectCache.set(upa, narrativeObject);
        return narrativeObject;
    }

    /**
     * Returns the current user's permissions for some narrative. This is either 'a', 'w', 'r', or 'n';
     * @param {number} wsId workspace id for a narrative of interest
     */
    async getUserPermission(wsId: number, username: string): Promise<string> {
        const ws = new WorkspaceClient({
            url: this.workspaceURL,
            timeout: this.timeout,
            token: this.token
        });
        const result = await ws.get_permissions_mass(
            { workspaces: [{ id: wsId }] },
        );
        // )[0].perms[0];

        const perms = result.perms[0];

        // TODO: um, it should not be possible to see a narrative in search for
        // which one has no permission!
        return perms[username] || "n";
    }
}
