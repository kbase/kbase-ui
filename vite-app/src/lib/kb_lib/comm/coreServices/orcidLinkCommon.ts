

// export interface ORCIDAuth {
//     access_token: string;
//     expires_in: number;
//     id_token: string;
//     name: string;
//     orcid: string;
//     refresh_token: string;
//     scope: string
//     token_type: string;

import { JSONObject } from "lib/json";

// }

// export interface LinkRecord {
//     created_at: number,
//     expires_at: number;
//     retires_at: number;
//     username: string;
//     orcid_auth: ORCIDAuth
// }


export interface ORCIDAuthPublic extends JSONObject {
    expires_in: number;
    name: string;
    orcid: string;
    scope: string
}

export interface LinkRecordPublic extends JSONObject {
    created_at: number,
    expires_at: number;
    retires_at: number;
    username: string;
    orcid_auth: ORCIDAuthPublic
}

export interface ORCIDAuthPublicNonOwner extends JSONObject {
    orcid: string;
    name: string;
}

export interface LinkRecordPublicNonOwner {
    username: string;
    orcid_auth: ORCIDAuthPublicNonOwner
}

// ORCID User Profile (our version)

export interface Affiliation extends JSONObject {
    name: string;
    role: string;
    startYear: string;
    endYear: string | null;
}

export interface ORCIDFieldGroupBase extends JSONObject {
    private: boolean;
}

export interface ORCIDFieldGroupPrivate extends ORCIDFieldGroupBase {
    private: true;
}

export interface ORCIDFieldGroupAccessible<T extends JSONObject> extends ORCIDFieldGroupBase {
    private: false;
    fields: T
}

export type ORCIDFieldGroup<T extends JSONObject> =
    ORCIDFieldGroupPrivate |
    ORCIDFieldGroupAccessible<T>;

export interface ORCIDNameFieldGroup extends JSONObject {
    firstName: string;
    lastName: string | null;
    creditName: string | null;
}

export interface ORCIDBiographyFieldGroup extends JSONObject {
    bio: string;
}

// export interface ORCIDActivitiesFieldGroup {
//     employments: Array<Affiliation>
//     // works: Array<Work>
//     // huh? missing some fields, and what is works doing here?
// }

export interface ORCIDEmailFieldGroup extends JSONObject {
    emailAddresses: Array<string>
}

export interface ORCIDProfile extends JSONObject {
    // TODO: split into profile and info? E.g. id in info, profile info in profile...
    orcidId: string;
    nameGroup: ORCIDFieldGroup<ORCIDNameFieldGroup>
    biographyGroup: ORCIDFieldGroup<ORCIDBiographyFieldGroup>;
    // activitiesGroup: ORCIDFieldGroup<ORCIDActivitiesFieldGroup>;
    emailGroup: ORCIDFieldGroup<ORCIDEmailFieldGroup>;
    employments: Array<Affiliation>
}