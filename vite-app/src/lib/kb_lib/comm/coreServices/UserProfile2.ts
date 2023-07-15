import { JSONArrayOf, JSONObject } from '@kbase/ui-lib/lib/json';
import { JSONValue, isJSONArray, isJSONObject } from 'lib/json';
import { JSONLikeObject } from 'lib/kb_lib/jsonLike';
import { hasOwnProperty } from 'lib/utils';
import { ServiceClient } from '../JSONRPC11/ServiceClient';

export interface UserProfileMetadata extends JSONObject {
    createdBy: string;
    created: string;
}

export interface UserProfilePreferenceSetting extends JSONObject {
    value: JSONValue;
    createdAt: number;
    updatedAt: number;
}

export type UserProfilePreferences = Record<string, UserProfilePreferenceSetting>

export interface UserProfileAffiliation extends JSONLikeObject {
    title: string;
    organization: string;
    started: number;
    ended?: number | null;
}

export type UserProfileAffiliations = Array<UserProfileAffiliation>

// TODO: not sure about whether nullable fields should be allowed or preferred, or if they should just be optional.
export interface UserProfileUserdata extends JSONLikeObject {
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

export interface UserProfileSynced extends JSONObject {
    gravatarHash: string;
}

export interface UserProfilePluginSetting<T extends JSONValue> extends JSONLikeObject {
    setting: T;
}

export interface UserProfilePluginSettingsDataSearch extends JSONObject {
    history: {
        search: {
            history: Array<string>;
            time: {
                $numberLong: string
            }
        }
    }
}

export interface UserProfilePluginSettingsJGISearch extends JSONObject {
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

export interface UserProfilePluginSettingsPublicSearch extends JSONObject {
    history: {
        search: {
            history: Array<string>;
            time: {
                $numberLong: string
            }
        }
    }
}

export interface UserProfilePluginSettingsUserProfile extends JSONObject {
    displayORCID: boolean;
}

export interface UserProfilePlugins extends JSONLikeObject {
    "data-search"?: UserProfilePluginSetting<UserProfilePluginSettingsDataSearch>
    "jgi-search"?: UserProfilePluginSetting<UserProfilePluginSettingsJGISearch>
    "public-search"?: UserProfilePluginSetting<UserProfilePluginSettingsPublicSearch>
    "user-profile"?: UserProfilePluginSetting<UserProfilePluginSettingsUserProfile>
}

export interface UserProfileSurveyData extends JSONObject {
    referralSources: {
        question: string;
        response: Record<string, string>
    }
}

export interface UserProfileUser extends JSONObject {
    username: string;
    realname: string;
}

export interface UserProfileProfile extends JSONLikeObject {
    metadata: UserProfileMetadata;
    userdata: UserProfileUserdata;
    synced: UserProfileSynced;
    preferences?: UserProfilePreferences;
    plugins?: UserProfilePlugins;
    surveydata?: UserProfileSurveyData
}

export interface UserProfile extends JSONLikeObject {
    user: UserProfileUser,
    profile: UserProfileProfile,
}

export interface UserProfileUpdate extends JSONLikeObject {
    user: UserProfileUser;
    profile: {
        userdata?: UserProfileUserdata;
        preferences?: UserProfilePreferences;
    }
}


interface AssertTypeOfOptions {
    optional?: boolean;
}

function assertTypeOf(object: JSONObject, name: string, type: string, optional: AssertTypeOfOptions = {}) {
    if (!isTypeOf(object, name, type)) {
        if (isTypeOf(object, name, 'undefined') && optional) {
            return;
        }
        throw new Error(`Property "${name}" is not of the expected type "${type}"`);
    }
}

function isTypeOf(object: JSONObject, name: string, type: string) {
    return typeof object[name] === type;
}

// function validateProfileUpdate(possible: unknown): asserts possible is UserProfileUpdate {
//     if (!isJSONObject(possible)) {
//         throw new Error("User profile update is not an object");
//     }
// }

// Complete cheat?
// But any json like is also a json object, but we do need to remove
// any properties which are explicitly set to "uknown".
function jsonLikeToJSON(jsonLike: JSONLikeObject): JSONObject {
    return jsonLike as unknown as JSONObject;
}


// TODO: incomplete
function validateProfile(possibleProfile: unknown): asserts possibleProfile is UserProfile {
    if (!isJSONObject(possibleProfile)) {
        throw new Error("User profile is not an object");
    }

    if (!hasOwnProperty(possibleProfile, 'user')) {
        throw new Error('User profile missing "user" property');
    }

    if (!hasOwnProperty(possibleProfile, "profile")) {
        throw new Error('User profile missing "profile" property');
    }

    const profile = possibleProfile.profile;

    if (!isJSONObject(profile)) {
        throw new Error('User profile "profile" is not an object');
    }

    if (!hasOwnProperty(profile, "userdata")) {
        throw new Error('User profile missing "userdata" property');
    }
    const userdata = profile.userdata;
    if (!isJSONObject(userdata)) {
        throw new Error('User profile "userdata" is not an object');
    }

    if (hasOwnProperty(userdata, "affiliations")) {
        const affiliations = userdata["affiliations"];
        if (!isJSONArray(affiliations)) {
            throw new Error('User profile "affiliations" is not an array');
        }
        const fixedAffiliations = affiliations
            .map((affiliation) => {
                if (!isJSONObject(affiliation)) {
                    throw new Error('User profile "affiliation" is not an object');
                }
                // Check fields.
                assertTypeOf(affiliation, "title", "string");
                assertTypeOf(affiliation, "organization", "string");
                assertTypeOf(affiliation, "started", "number");
                assertTypeOf(affiliation, "ended", "number", { optional: true });

                // if (!isTypeOf(affiliation, "started", "number")) {
                //     const possibleStarted = affiliation["started"];
                //     if (typeof possibleStarted === "string") {
                //         const started = parseInt(possibleStarted);
                //         if (isNaN(started)) {
                //             console.error("Invalid started year in profile", affiliation);
                //             throw new Error('affiliation "started" year is not a number or compatible string');
                //             // return null;
                //         } else {
                //             affiliation["started"] = started;
                //         }
                //     } else {
                //         // console.error("Invalid started year in profile", affiliation);
                //         // return null;
                //         throw new Error('affiliation "started" year is not a number or string');
                //     }
                // }
                // if (
                //     !(sertTypeOf(affiliation, "ended", "number") ||
                //         (assertTypeOf(affiliation, "ended", "object") &&
                //             affiliation["ended"] === null))
                // ) {
                //     const possibleEnded = affiliation["ended"];
                //     if (typeof possibleEnded === "string") {
                //         if (possibleEnded === "") {
                //             // console.warn('dropping affiliation')
                //             // delete affiliation['ended'];
                //             affiliation["ended"] = null;
                //         } else {
                //             const ended = parseInt(possibleEnded);
                //             if (isNaN(ended)) {
                //                 affiliation["ended"] = null;
                //                 // console.error('Invalid ended year in profile', affiliation);
                //                 // return null;
                //                 // throw new Error('affiliation "ended" is not a number or compatible string');
                //             } else {
                //                 affiliation["ended"] = ended;
                //             }
                //         }
                //     } else {
                //         console.warn(
                //             `Invalid ended year in profile, expected number or string, got ${typeof possibleEnded}`,
                //             possibleEnded,
                //         );
                //         return null;
                //         // throw new Error('affiliation "ended" year is not a number or string');
                //     }
                // }
                return affiliation;
            }).filter((affiliation) => {
                return affiliation === null ? false : true;
            });
        userdata.affiliations = fixedAffiliations;
    }

    // if (hasOwnProperty(profile, "preferences"))
    // TODO: more assertions

    // return (possibleProfile as unknown) as UserProfile;
}

// Client implementation


export type GetUserProfileParams = Array<string>;

export type GetUserProfileResult = Array<UserProfile>;


export interface UpdateUserProfileParams extends JSONLikeObject { profile: UserProfileUpdate };

// no result



export default class UserProfileClient extends ServiceClient {
    module: string = 'UserProfile';

    async get_user_profile(
        params: GetUserProfileParams
    ): Promise<GetUserProfileResult> {
        const [result] = await this.callFunc<
            JSONArrayOf<GetUserProfileParams>,
            JSONArrayOf<JSONArrayOf<JSONObject>>
        >('get_user_profile', [params]);

        const finalResult = result.map((possibleUserProfile) => {
            validateProfile(possibleUserProfile);
            return possibleUserProfile;
        })

        return finalResult;
    }

    async update_user_profile(
        params: UpdateUserProfileParams
    ): Promise<void> {
        const methodParams = jsonLikeToJSON(params);
        await this.callFuncEmptyResult<
            JSONArrayOf<JSONObject>
        >('update_user_profile', [methodParams]);
    }
}
