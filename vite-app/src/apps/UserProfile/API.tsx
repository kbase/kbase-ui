import UserProfileClient from '@kbase/ui-lib/lib/comm/coreServices/UserProfile';
import { JSONValue } from '@kbase/ui-lib/lib/json';
import { SERVICE_CALL_TIMEOUT } from './constants';

import { DynamicServiceClient } from "apps/ORCIDLink/lib/DynamicServiceClient";
import { JSONObject, assertJSONObject, isJSONArray, isJSONObject } from 'lib/json';
import { hasOwnProperty } from './utils';


// TODO: replace the BFF calls with a regular dynamic service call!
export async function getBFFServiceUrl(token: string, serviceWizardURL: string) {
    const body = {
        method: 'ServiceWizard.get_service_status',
        version: '1.1',
        id: "123",
        params: [
            {
                module_name: 'userprofileuibff',
                version: null
            }
        ]
    };
    const stringBody = JSON.stringify(body);
    const response = await fetch(serviceWizardURL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            Authorization: token
        },
        body: stringBody
    });
    if (response.status !== 200) {

        // return empty string so that the fetch API called this function
        // can generate error messages. 
        return '';
    } else {
        const responseJson = await response.json();
        return responseJson.result[0]['url'];
    }
}

export interface UserProfileMetadata {
    createdBy: string;
    created: string;
}

export interface UserProfilePreferenceSetting {
    value: JSONValue;
    createdAt: number;
    updatedAt: number;
}

export type UserProfilePreferences = Record<string, UserProfilePreferenceSetting>

export interface UserProfileSubset {
    userdata: UserProfileUserdata
    preferences?: UserProfilePreferences
    gravatarHash: string
}

export interface UserProfileAffiliation {
    title: string;
    organization: string;
    started: number;
    ended?: number | null;
}

export type UserProfileAffiliations = Array<UserProfileAffiliation>

// TODO: not sure about whether nullable fields should be allowed or preferred, or if they should just be optional.
export interface UserProfileUserdata {
    // Required by form so should always be present
    avatarOption: string;

    // Optional
    organization?: string | null;
    department?: string;
    gravatarDefault?: string; // not required unless avatarOptions === 'gravatar'
    affiliations?: UserProfileAffiliations
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    researchStatement?: string;
    researchInterests?: Array<string>;
    researchInterestsOther?: string | null;
    jobTitle?: string;
    jobTitleOther?: string;
    fundingSource?: string
}

export interface UserProfileSynced {
    gravatarHash: string;
}

export interface UserProfilePluginSetting<T> {
    setting: T;
}

export interface UserProfilePluginSettingsDataSearch {
    history: {
        search: {
            history: Array<string>;
            time: {
                $numberLong: string
            }
        }
    }
}

export interface UserProfilePluginSettingsJGISearch {
    history: {
        search: {
            history: Array<string>;
            time: {
                $numberLong: string
            }
        }
    },
    jgiDataTerms: {
        agreed: boolean,
        time: {
            $numberLong: string
        }
    }
}

export interface UserProfilePluginSettingsPublicSearch {
    history: {
        search: {
            history: Array<string>;
            time: {
                $numberLong: string
            }
        }
    }
}

export interface UserProfilePluginSettingsUserProfile {
    displayORCID?: boolean;
}

export interface UserProfilePlugins {
    "data-search"?: UserProfilePluginSetting<UserProfilePluginSettingsDataSearch>
    "jgi-search"?: UserProfilePluginSetting<UserProfilePluginSettingsJGISearch>
    "public-search"?: UserProfilePluginSetting<UserProfilePluginSettingsPublicSearch>
    "user-profile"?: UserProfilePluginSetting<UserProfilePluginSettingsUserProfile>
}

export interface UserProfileSurveyData {
    referralSources: {
        question: string;
        response: Record<string, string>
    }
}

export interface UserProfileUser {
    username: string;
    realname: string;
}

export interface UserProfileProfile {
    metadata: UserProfileMetadata;
    userdata: UserProfileUserdata;
    synced: UserProfileSynced;
    preferences?: UserProfilePreferences;
    plugins?: UserProfilePlugins;
    surveydata?: UserProfileSurveyData
}


export interface UserProfile {
    user: UserProfileUser,
    profile: UserProfileProfile,
}

export interface UserProfileUpdate {
    user: UserProfileUser;
    profile: {
        userdata: UserProfileUserdata;
        preferences: UserProfilePreferences;
    }
}

export function convertNumberLong(valueFromMongo: JSONObject): JSONObject {
    function convert(value: JSONValue): JSONValue {
        if (isJSONObject(value)) {
            if (hasOwnProperty(value, '$numberLong') && (typeof value.$numberLong === 'string')) {
                return parseInt(value.$numberLong);
            } else {
                return Object.entries(value).reduce<Record<string, JSONValue>>((obj, [key, value]) => {
                    obj[key] = convert(value);
                    return obj;
                }, {}) as JSONObject;
            }
        } else if (isJSONArray(value)) {
            return value.map((item) => {
                return convert(item);
            })
        } else {
            return value;
        }
    }
    return convert(valueFromMongo) as JSONObject;
}

/**
 * Profile 
 */

/**
 * user profile service uses this type
 * typedef structure {
        User user;
        UnspecifiedObject profile;
    } UserProfile;
 *  "UnspecifiedObject profile;"
 * is specified below
 */
// export interface UserProfileService {
//     user: UsernameRealname;
//     profile: {
//         userdata: ProfileUserdata,
//         synced: {
//             gravatarHash: string;
//         };
//         // TODO: the rest of the profile structure, at least preserved
//         // as any??
//     };

// }


export interface AssertFieldTypeOptions {
    nullable?: boolean;
}

function assertFieldType(obj: JSONObject, name: string, types: Array<string>, options: AssertFieldTypeOptions = {}) {
    const value = obj[name];
    const valueType = typeof value;
    if (!types.includes(valueType)) {
        if (options.nullable && value === null) {
            return;
        }
        throw new Error(`Property "${name}" is not of the expected type "${types.join('|')}", rather is a "${valueType}"`)
    }
}

export type ProfileWarnings = Array<string>;

/**
 * Inspect the profile, ensuring fields are within spec and if any are out of spec, repair them.
 * 
 * There is not really a case for failure here. In the most egregious cases we may just have to 
 * remove a field value.
 * 
 * See the ...
 * 
 * @param rawPossibleUserProfile 
 * @returns 
 */
function fixProfile(rawPossibleUserProfile: unknown): [UserProfile, ProfileWarnings] {
    const warnings: ProfileWarnings = [];
    // Let us establish that this is, generally, a valid JSON-compatible
    // object.
    assertJSONObject(rawPossibleUserProfile, "User profile is not an object");

    // Here we convert any "$numberLong" instances into plain numbers.
    // Mongo db converts json numbers of a certain scale to an object
    // like {$numberLong: "number"}, where the number becomes a string.
    // Since these should all originate from Javascript numbers in the
    // browser, it should be save to convert them back. 

    const possibleUserProfile = convertNumberLong(rawPossibleUserProfile);


    // TODO: remove, this is so incredibly unlikely; user and profile,
    // and the property structure of user, are the only things that the
    // user profile service guarantees.
    if (!hasOwnProperty(possibleUserProfile, 'user')) {
        throw new Error('User profile missing "user" property');
    }

    if (!hasOwnProperty(possibleUserProfile, "profile")) {
        throw new Error('User profile missing "profile" property');
    }

    const profile = possibleUserProfile.profile;

    if (!isJSONObject(profile)) {
        throw new Error('User profile "profile" is not an object');
    }

    // if (!hasOwnProperty(profile, "userdata")) {
    //     throw new Error('User profile missing "userdata" property');
    // }

    if (!hasOwnProperty(profile, "userdata") || !isJSONObject(profile.userdata)) {
        // throw new Error('User profile "userdata" is not an object');
        // Fix it up!
        profile.userdata = {}
    }


    if (hasOwnProperty(profile.userdata, "affiliations")) {
        const affiliations = profile.userdata["affiliations"];
        if (!isJSONArray(affiliations)) {
            throw new Error('User profile "affiliations" is not an array');
        }
        const fixedAffiliations = affiliations
            .filter((affiliation) => {
                // this just to deal with broken affiliations during testing.
                if (!isJSONObject(affiliation)) {
                    console.warn(`Omitting non-object affiliation: ${affiliation}`)
                    return false;
                }
                // Rarely a 
                return true;
            })
            .map((affiliation, index) => {
                if (!isJSONObject(affiliation)) {
                    throw new Error(`User profile "affiliation" # ${index}is not an object`);
                }
                // If any field fails validation, we simply omit the affiliation and generate a warning.
                try {
                    assertFieldType(affiliation, "title", ["string"]);
                    assertFieldType(affiliation, "organization", ["string"]);
                    assertFieldType(affiliation, "started", ["number", "string"]);
                    assertFieldType(affiliation, "ended", ["number", "string", "undefined"], { nullable: true });
                } catch (ex) {
                    warnings.push(`An invalid affiliation record was removed: ${JSON.stringify(affiliation)}`)
                    return false;
                }

                // See if there are any extant cases of this!
                if (typeof affiliation["started"] === "string") {
                    console.warn('Converting affiliation started date from string to number');
                    const possibleStarted = affiliation["started"];

                    // Okay, this rule is a bit looser than the ui, but that is okay.
                    if (!/[0-9]{4}/.test(affiliation['started'])) {
                        console.warn(`Invalid start year in affiliation ${index} - skipping affiliation`, affiliation);
                        // throw new Error('affiliation "started" year is not a number or compatible string');
                        affiliation["started"] = null;
                        // WHAT?? Oh, I see, these were filtered out afterwards. This may explain why some 
                        // "null" affiliations have been seen in profiles in CI - the filter at the end was
                        // probably added later. Let's change this to "false" to clarify, and I agree it
                        // is best to remove these, although it is interesting to contemplate an infinite
                        // affiliation...
                        warnings.push(`An affiliation record with an invalid start year was omitted: ${JSON.stringify(affiliation)}`)
                        return false;
                    } else {
                        affiliation["started"] = parseInt(possibleStarted);
                    }
                }

                if (typeof affiliation["ended"] === "string") {
                    console.warn('Converting affiliation ended date from string to number');
                    const possibleStarted = affiliation["ended"];

                    // Okay, this rule is a bit looser than the ui, but that is okay.
                    if (!/[0-9]{4}/.test(affiliation['ended'])) {
                        console.warn(`Invalid end year in affiliation ${index}`, affiliation);
                        affiliation["ended"] = null;
                        // WHAT??
                        // return null;
                    } else {
                        affiliation["ended"] = parseInt(possibleStarted);
                    }
                }
                return affiliation;
            }).filter((affiliation) => {
                return affiliation
            });
        profile.userdata.affiliations = fixedAffiliations;
    }

    if (!hasOwnProperty(profile, "synced") || !isJSONObject(profile.synced)) {
        // throw new Error('User profile "userdata" is not an object');
        // Fix it up!
        profile.synced = {}
    }

    // if (hasOwnProperty(profile, "preferences"))
    // TODO: more assertions

    return [possibleUserProfile as unknown as UserProfile, warnings];
}


/**
 * Return profile data
 * @param id profile id
 * @param token KBase session cookie
 * @param serviceWizardURL URL for the service wizard in the current environment
 */
export async function fetchProfileAPI(username: string, token: string, serviceWizardURL: string): Promise<[UserProfile, ProfileWarnings]> {
    const bffServiceUrl = await getBFFServiceUrl(token, serviceWizardURL);
    const url = bffServiceUrl + '/fetchUserProfile/' + username;
    const response = await fetch(url, {
        method: 'GET'
    });
    if (response.status === 200) {
        try {
            const possibleProfile = await response.json();
            return fixProfile(possibleProfile);
        } catch (err) {
            console.error('profile fetch failed', err);
            throw new Error(`Error parsing profile response to json: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    } else {
        throw new Error(`Error fetching user profile: ${response.statusText}`);
    }
}

export async function fetchProfileAPI2(username: string, token: string, url: string): Promise<[UserProfile, ProfileWarnings]> {
    const client = new UserProfileClient({ url, timeout: SERVICE_CALL_TIMEOUT, token });
    const [profile] = await client.get_user_profile([username]);
    return fixProfile(profile);

    // TODO: the bff service can break with ill-formed profiles, as revealed during development.
    //       best if it services for both saving and fetching profiles, as it can apply the same
    //       validation - and since the u.p. service does not apply any to the profile
    // const bffServiceUrl = await getBFFServiceUrl(token, baseURL);
    // const url = bffServiceUrl + '/fetchUserProfile/' + username;
    // const response = await fetch(url, {
    //     method: 'GET'
    // });
    // if (response.status === 200) {
    //     try {
    //         const possibleProfile = await response.json();
    //         validateProfile(possibleProfile);
    //         return possibleProfile;
    //     } catch (err) {
    //         console.error('profile fetch failed', err);
    //         throw new Error(`Error parsing profile response to json: ${err instanceof Error ? err.message : 'Unknown error'}`);
    //     }
    // } else {
    //     throw new Error(`Error fetching user profile: ${response.statusText}`);
    // }
}

export interface RPC11<T> {
    version: '1.1'
    method: string
    id: string
    params: Array<T>
}

export interface UpdateProfileParams {
    profile: UserProfileUpdate
}

/**
 * update profile 
 * method 'UserProfile.update_user_profile' takes top level key of profile object. 
 * @param token 
 * @param url 
 * @param userdata 
 * @param user
 */
export async function updateProfileAPI(token: string, url: string, profile: UserProfileUpdate): Promise<[number, string]> {
    const rpc: RPC11<UpdateProfileParams> = {
        version: '1.1',
        method: 'UserProfile.update_user_profile',
        id: "123",
        params: [{ profile: profile }]
    };
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            Authorization: token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rpc)
    });
    if (response.status === 200) {
        return [response.status, ''];
    } else {
        const responseJSON = await response.json();
        return [
            response.status,
            responseJSON.error.message
        ];
    }
}

/**
 * Return list of narratives
 * @param param shared/mine/public
 * @param token kbase session cookie
 */
export async function fetchNarrativesAPI(param: string, token: string, serviceWizardURL: string) {
    // TODO: use the dynamic service client.
    const bffServiceUrl = await getBFFServiceUrl(token, serviceWizardURL);
    const url = bffServiceUrl + '/narrative_list/' + param;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Authorization: token
        }
    });
    if (response.status === 500) {
        console.error('Fetch Narratives 500 response:', response);
        return [response.status, response.statusText];
    }
    try {
        const narratives = await response.json();
        return narratives;
    } catch (err) {
        console.error('fetch narratives failed', response);
        return [response.status, response.statusText];
    }
}

export interface CustomFields {
    [k: string]: string;
}
// export interface GroupResourcesCount {
//     [k:string]: string
// }
// export interface GroupResources {
//     [k:string]: string
// }
export interface GroupsUser {
    name: string;
    joined: number;
    lastvisit: number;
    custom: CustomFields;
}
export interface Group {
    id: string;
    private: boolean;
    privatemembers: boolean;
    role: string;
    lastvisit: number;
    name: string;
    owner: GroupsUser,
    admins: Array<GroupsUser>,
    members: Array<GroupsUser>,
    memcount: number;
    createdate: number;
    moddate: number;
    // resources: GroupResources,
    // rescount: GroupResourcesCount,
    custom: CustomFields;
}


/**
 * returns list of orgs that profile and logged in user are both associated with.
 * @param id id of the profile
 * @param token kbase session cookie
 * @param serviceWizardURL URL for the service wizard in the current environment
 */
// export async function fetchOrgsOfProfileAPI(username: string, token: string, serviceWizardURL: string) {
//     const bffServiceUrl = await getBFFServiceUrl(token, serviceWizardURL);
//     const url = bffServiceUrl + '/org_list/' + username;
//     const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//             Authorization: token
//         }
//     });
//     if (response.status !== 200) {
//         console.error('fetch org failed', response);
//         throw new Error(`Error fetching groups: ${response.statusText}`);
//     }
//     try {
//         return await (response.json() as unknown) as Array<Group>;
//     } catch (err) {
//         console.error('fetch org failed', response);
//         throw new Error(`Error fetching groups: ${err instanceof Error ? err.message : "Unknown error"}`);
//     }
// }

// export async function fetchOrgsOfProfileAPI(username: string, token: string, baseURL: string) {
//     const bffServiceUrl = await getBFFServiceUrl(token, baseURL);
//     const url = bffServiceUrl + '/org_list/' + username;
//     const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//             Authorization: token
//         }
//     });
//     if (response.status !== 200) {
//         console.error('Org Fetch Error:', response);
//         return [response.status, response.statusText];
//     };
//     try {
//         const orgs = await response.json();
//         return orgs;
//     } catch (err) {
//         console.error('fetch org failed', response);
//         return [response.status, response.statusText];
//     };
// };

// export interface OrganizationBriefInfo {
//     owner: string;
//     rescount: {
//         workspace: number;
//     };
//     moddate: number;
//     private: boolean;
//     role: string;
//     memcount: number;
//     custom: {
//         homeurl: string;
//         relatedgroups: string;
//         logourl: string;
//         researchinterests: string;
//     };
//     name: string;
//     createdate: number;
//     lastvisit: number;
//     id: string;
// }

// export async function fetchOrgsOfProfileAPI(username: string, token: string, groupsURL: string): Promise<Array<OrganizationBriefInfo>> {
//     const url = `${groupsURL}/group?role=Member`;
//     const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//             Authorization: token
//         }
//     });
//     if (response.status !== 200) {
//         console.error('fetch org failed', response);
//         throw new Error(`Error fetching groups: ${response.statusText}`);
//     }
//     try {
//         return await response.json() as Array<OrganizationBriefInfo>;
//     } catch (err) {
//         console.error('fetch org failed', response);
//         throw new Error(`Error fetching groups: ${err.message}`);
//     };
// };

/**
 * returns list of users that are filtered by search values
 * @param searchValue search values
 * @param token kbase session cookie
 */
export async function filteredUserAPI(searchValue: string, url: string) {
    const rpc_message = {
        version: '1.1',
        method: 'UserProfile.filter_users',
        params: [{ filter: searchValue }]
    };
    const response = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rpc_message)
    });
    if (response.status === 500) {
        console.error('500 response:', response);
        return [response.status, response.statusText];
    }
    try {
        const { result: [users] } = await response.json();
        return [response.status, users];
    } catch (err) {
        console.error('fetch search users failed', response);
        return [response.status, response.statusText];
    }
}

export interface NarrativeData {
    wsID: string;
    permission: string;
    name: string;
    last_saved: number;
    users: object;
    owner: string;
    narrative_detail: {
        creator: string;
    };
}


export class UserProfileBFFService extends DynamicServiceClient {
    module = 'userprofileuibff';

    async narrativeList(narrativeListType: string): Promise<Array<NarrativeData>> {
        const result = await this.get<Array<NarrativeData>>(`/narrative_list/${narrativeListType}`);
        return result;
    }

    async orgsList(username: string): Promise<Array<Group>> {
        const result = await this.get<Array<Group>>(`/org_list/${username}`);
        return result;
        // const url = bffServiceUrl + '/org_list/' + username;
    }

}