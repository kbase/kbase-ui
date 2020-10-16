import { ServiceClient } from '../JSONRPC11/ServiceClient';

export interface User {
    username: string;
    realname: string;
}

export interface UserProfile {
    user: User,
    profile: {
        synced: {
            gravatarHash: string;
        };
        userdata: {
            jobTitle: string,
            jobTitleOther: string,
            organization: string;
            city: string;
            state: string;
            country: string;
            avatarOption: string;
            gravatarDefault: string;
        };
        metadata: {
            createdBy: string;
            created: string;
        };
        // plugins: {
        //     organizations?: OrganizationsSettings;
        // };
    };
}

export type GetUserProfileParams = Array<string>;

export type GetUserProfileResult = Array<UserProfile>;

export default class UserProfileClient extends ServiceClient {
    module: string = 'UserProfile';

    // async status(): Promise<StatusResult> {
    //     const [result] = await this.callFunc<[], [StatusResult]>('status', []);
    //     return result;
    // }

    // async get_sample(params: GetSampleParams): Promise<GetSampleResult> {
    //     const [result] = await this.callFunc<[GetSampleParams], [GetSampleResult]>('get_sample', [params]);
    //     return result;
    // }

    // async get_data_links_from_sample(params: GetDataLinksFromSampleParams): Promise<GetDataLinksFromSampleResult> {
    //     const [result] = await this.callFunc<[GetDataLinksFromSampleParams], [GetDataLinksFromSampleResult]>('get_data_links_from_sample', [params]);
    //     return result;
    // }

    // async get_metadata_key_static_metadata(params: GetMetadataKeyStaticMetadataParams): Promise<GetMetadataKeyStaticMetadataResult> {
    //     const [result] = await this.callFunc<[GetMetadataKeyStaticMetadataParams], [GetMetadataKeyStaticMetadataResult]>('get_metadata_key_static_metadata', [params]);
    //     return result;
    // }

    // async get_sample_acls(params: GetSampleACLsParams): Promise<GetSampleACLsResult> {
    //     const [result] = await this.callFunc<[GetSampleACLsParams], [GetSampleACLsResult]>('get_sample_acls', [params]);
    //     return result;
    // }

    async get_user_profile(params: GetUserProfileParams): Promise<GetUserProfileResult> {
        return await this.callFunc<GetUserProfileParams, GetUserProfileResult>('get_user_profile', params);
    }
}