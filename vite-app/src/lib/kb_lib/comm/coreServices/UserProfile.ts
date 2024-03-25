import { JSONArrayOf, JSONObject, JSONObjectOf } from '@kbase/ui-lib/lib/json';
import { JSONValue } from 'lib/json';
import { toJSON } from 'lib/jsonLike';
import { ServiceClient } from '../JSONRPC11/ServiceClient';

export interface User extends JSONObject {
    username: string;
    realname: string;
}

export interface Affiliation extends JSONObject {
    title: string;
    organization: string;
    started: number;
    ended: number | null;
}

export interface UserProfile extends JSONObject {
    user: User;
    profile: {
        synced: {
            gravatarHash: string;
        };
        userdata: {
            jobTitle: string;
            jobTitleOther: string;
            organization: string;
            department: string;
            affiliations: Array<Affiliation>;
            city: string;
            state: string;
            postalCode: string;
            country: string;
            researchStatement: string;
            avatarOption: string;
            gravatarDefault: string;
            researchInterests: Array<string>;
            researchInterestsOther: string | null;
            fundingSource: string;
        };
        metadata: {
            createdBy: string;
            created: string;
        };
        plugins: JSONObjectOf<JSONObject>;
        preferences: JSONObject;
    };
}

export type GetUserProfileParams = Array<string>;

export type GetUserProfileResult = Array<UserProfile>;

export interface UserProfileUser {
    username: string;
    realname: string;
}

export interface UserProfileAffiliation {
    title: string;
    organization: string;
    started: number;
    ended?: number | null;
}

export type UserProfileAffiliations = Array<UserProfileAffiliation>

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

export interface UserProfilePreferenceSetting {
    value: JSONValue;
    createdAt: number;
    updatedAt: number;
}

export type UserProfilePreferences = Record<string, UserProfilePreferenceSetting>

export interface UserProfileUpdate {
    user: UserProfileUser;
    profile: {
        userdata: UserProfileUserdata;
        preferences: UserProfilePreferences;
    }
}

export interface UpdateUserProfileParams {
    profile: UserProfileUpdate
}


export interface UserProfileInitial {
    user: UserProfileUser;
    profile: {
        userdata: UserProfileUserdata;
    }
}

export interface SetUserProfileParams {
    profile: UserProfileInitial
}

export interface SearchUsersParams extends JSONObject {
    filter_users: string
}


export default class UserProfileClient extends ServiceClient {
    module: string = 'UserProfile';

    async get_user_profile(
        params: GetUserProfileParams
    ): Promise<GetUserProfileResult> {
        const [result] = await this.callFunc<
            JSONArrayOf<GetUserProfileParams>,
            JSONArrayOf<GetUserProfileResult>
        >('get_user_profile', [params]);
        return result;
    }

    async update_user_profile(params: UpdateUserProfileParams): Promise<void> {
        return await this.callFuncEmptyResult<[JSONValue]>(
            'update_user_profile', 
            [toJSON(params)])
    }

    async set_user_profile(params: SetUserProfileParams): Promise<void> {
        return await this.callFuncEmptyResult<[JSONValue]>(
            'set_user_profile', 
            [toJSON(params)])
    }

    async filter_users(params: SearchUsersParams): Promise<Array<User>> {
        const [result] =  await this.callFunc<Array<JSONObject>, Array<JSONObject>>(
            'filter_users', 
            [params]
        );

        return result as unknown as Array<User>;
    }
    
}
