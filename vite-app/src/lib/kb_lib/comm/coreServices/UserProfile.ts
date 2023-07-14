import { JSONArrayOf, JSONObject, JSONObjectOf } from '@kbase/ui-lib/lib/json';
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
}
