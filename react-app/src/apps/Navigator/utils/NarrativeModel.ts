/* eslint-disable camelcase */
import GenericClient from "../../../lib/kb_lib/comm/JSONRPC11/GenericClient";

/**
 * Interfaces that represent Narrative data returned from the search service.
 */

/**
 * The Cell is the unitary piece of a Narrative where info gets stored and apps get run.
 */
export interface NarrativeDocCell {
  desc: string;
  cell_type: string;
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
export interface Doc {
  access_group: number;
  cells: Array<NarrativeDocCell>;
  copied: boolean | null;
  creation_date: string;
  creator: string;
  data_objects: Array<DataObject>;
  is_narratorial: boolean;
  is_public: boolean;
  is_temporary: boolean;
  modified_at: number;
  narrative_title: string;
  obj_id: number;
  obj_name: string;
  obj_type_module: string;
  obj_type_version: string;
  owner: string;
  shared_users: Array<string>;
  tags: Array<string>;
  timestamp: number;
  total_cells: number;
  version: number;
}

export interface Cell {
  cell_type: string;
  metadata: object;
}

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
  // authInfo: AuthInfo;
  // config: Config;
  constructor({workspaceURL, token}: {workspaceURL: string, token: string}) {
    this.workspaceURL = workspaceURL;
    this.token = token;
  }

  clearCache() {
    narrativeObjectCache.clear();
  }

  async fetchNarrative(upa: string): Promise<NarrativeObject> {
    if (narrativeObjectCache.has(upa)) {
      return narrativeObjectCache.get(upa)!;
    }
    const client = new GenericClient({
      module: 'Workspace',
      url: this.workspaceURL,
      token: this.token,
      timeout: 1000
    });
    const [result] = await client.callFunc('get_objects2', [
      { objects: [{ ref: upa }] },
    ]);
    const narrativeObject = result.data[0].data;
    narrativeObjectCache.set(upa, narrativeObject);
    return narrativeObject;
  }

  /**
   * Returns the current user's permissions for some narrative. This is either 'a', 'w', 'r', or 'n';
   * @param {number} wsId workspace id for a narrative of interest
   */
  async getUserPermission(wsId: number, username: string): Promise<string> {
    const client = new GenericClient({
      module: 'Workspace',
      url: this.workspaceURL,
      token: this.token,
      timeout: 1000
    });

    const [result] = await client.callFunc('get_permissions_mass', [
      { workspaces: [{ id: wsId }] },
    ]);
  // )[0].perms[0];

    const perms = result.perms[0];

    // TODO: um, it should not be possible to see a narrative in search for
    // which one has no permission!
    return perms[username] || 'n';
  }
}
