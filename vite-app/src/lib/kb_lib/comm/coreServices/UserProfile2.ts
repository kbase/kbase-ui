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

function coerceToInt(value: unknown, acceptableTypes: Array<string>): number {
    if (!acceptableTypes.includes(typeof value)) {
        throw new Error(`Expected type in (${acceptableTypes.join(', ')}), got "${typeof value}"`)
    }

    switch (typeof value) {
        case 'string':
            return parseInt(value, 10);
        case 'number':
            return value;
        default:
            throw new Error(`Unsupported coercion from ${typeof value}`)
    }

}

interface AssertTypeOfOptions {
    optional?: boolean;
    nullable?: boolean;
}

function assertTypeOf(object: JSONObject, name: string, types: Array<string>, options: AssertTypeOfOptions = {}) {
    if (options.optional) {
        types.push('undefined');
    }
    const value = object[name];
    if (!types.includes(typeof value)) {
        if (!options.nullable || value !== null) {
            throw new Error(`Property "${name}" is not of the expected types "${types.join(', ')}"`);
        }
    }
}

// function isTypeOf(object: JSONObject, name: string, type: string) {
//     return typeof object[name] === type;
// }

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
function validateProfile(possibleProfile: unknown): UserProfile {
    if (!isJSONObject(possibleProfile)) {
        throw new Error("User profile is not an object");
    }

    // The top level "user" property
    // This should never be wrong, but we are just trying to be complete here, partly
    // as an exercise in thorough type validation.

    if (!hasOwnProperty(possibleProfile, 'user')) {
        throw new Error('User profile missing "user" property');
    }

    const user = possibleProfile.user;

    if (!isJSONObject(user)) {
        throw new Error('User profile "user" property must be an object');
    }

    assertTypeOf(user, 'username', ['string']);
    assertTypeOf(user, 'realname', ['string']);

    // The top level "profile" property is where everything else is. It has no definition
    // in the UserProfile service, so the only thing that assures it's correct structure
    // is the code that creates it, that edits it, and here.

    if (!hasOwnProperty(possibleProfile, "profile")) {
        throw new Error('User profile missing "profile" property');
    }

    const profile = possibleProfile.profile;

    if (!isJSONObject(profile)) {
        throw new Error('User profile "profile" is not an object');
    }

    // Userdata is where what we think of as the user profile resides.

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

                assertTypeOf(affiliation, "title", ["string"]);
                assertTypeOf(affiliation, "organization", ["string"]);

                assertTypeOf(affiliation, "started", ["string", "number"]);
                affiliation.started = coerceToInt(affiliation.started, ['string', 'number']);


                assertTypeOf(affiliation, "started", ["string", "number"], { optional: true, nullable: true });
                if (typeof affiliation.ended !== 'undefined' && affiliation.ended !== null) {
                    affiliation.ended = coerceToInt(affiliation.ended, ['string', 'number']);
                }


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

        // More to DO!
    }

    // if (hasOwnProperty(profile, "preferences"))
    // TODO: more assertions

    // return (possibleProfile as unknown) as UserProfile;
    // TODO: avoid this! we should create a user profile out of the "parts" we have validated
    // and potentially "fixed" above.
    return possibleProfile as UserProfile;
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

        return result.map((possibleUserProfile) => {
            return validateProfile(possibleUserProfile);
        })
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
