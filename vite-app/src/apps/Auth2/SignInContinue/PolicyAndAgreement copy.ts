// define([
//     'bluebird',
//     'marked',
//     'lib/utils',
//     'kb_common_ts/Auth2',
//     'lib/Features'
// ], (
//     Promise,
//     marked,
//     Utils,
//     auth2,
//     Features
// ) => {

import { UserPolicy } from "lib/kb_lib/Auth2";

import policiesData from '../resources/agreements/policies.json';

const policies = policiesData as unknown as Policies

/**
 * These interfaces model the policy data stored in policies.json.
 * Note that this is a long-term stopgap -- the policies should be served
 * up by a service, like the auth service.
 */

export interface PolicyVersionBase {
    version: number;
    begin: string;
    end?: string;
}

export interface PolicyVersionWithDocument extends PolicyVersionBase {
    document: string;
}

export interface PolicyVersionWithURL extends PolicyVersionBase {
    url: string;
}

export type PolicyVersion = PolicyVersionWithDocument | PolicyVersionWithURL;

export interface Policy {
    id: string;
    title: string;
    versions: Array<PolicyVersion>
}

export type Policies = Array<Policy>;

export interface UserPolicyAgrement {
    id: string;
    version: number;
    agreedAt: Date;
}

/**
 * This structure represents a policy and version in relation to the
 * current user, and helps answer the question - which policies have been agreed to,
 * which not yet, which are not yet effective, which are expired, etc.
 */

export type PolicyAgreementStatus = 'expired' | 'new' | 'current' | 'updated';

export interface PolicyAgreement {
    id: string;
    version: number;
    title: string;
    publishedAt: Date;
    expiredAt: Date | null;
    agreedAt: Date | null;
    status: PolicyAgreementStatus;
    statusSort: number;
    url: string | null;
    document: string | null;
}

/**
 * Differentiated from a "UserPolicy" (probablyl better named "PolicyAgreement") because
 * this one does not have an agreement timestamp, and the id and version or separated (!).
 * The latter is a quirk of the auth2 api. The reason for the lack of timestamp is that
 * the timestamp is added when the login "choice" is submitted, along with any "pending"
 * new policy agreements.
 */
export interface PendingPolicyAgreement {
    id: string;
    version: number;
}

export interface PolicyAndAgreementParams {
    // authURL: string;
    // authorization: string;
    policyids: Array<UserPolicy>;  // from the auth service user record
}



export default class PolicyAndAgreement {
    // auth2Client: Auth2;
    policyAgreements: Array<PolicyAgreement>;
    constructor({policyids}: PolicyAndAgreementParams) {
        // this.runtime = runtime;
        const userAgreements = this.parsePolicyAgreements(policyids);
        this.policyAgreements = this.getPolicyAgreements(userAgreements);
        // this.useAgreements = null;

        // this.auth2Client = new Auth2({
        //     baseUrl: authURL
        // });
    }

    // getLatestPolicies() {
    //     return policies.map(({id, title, versions}) => {
    //         const latestVersionId = Math.max.apply(
    //             null,
    //             versions.map((version) => {
    //                 return version.version;
    //             })
    //         );
    //         const {version, begin, end, document} = versions.filter((version) => {
    //             return version.version === latestVersionId;
    //         })[0];

    //         return {
    //             id, title, version, begin, end, document
    //         };
    //     });
    // }

    /**
     * Returns all policies.
     * The policy versions are modified to add a flag indicating whether
     * the policy is covered by an agreement (isAgreedTo).
     *
     * @returns
     */
    // getPolicies() {
    //     return policies.map(({id, title, versions}) => {
    //         const latestVersionId = Math.max.apply(
    //             null,
    //             versions.map((version) => {
    //                 return version.version;
    //             })
    //         );
    //         const {version, begin, end, document} = versions.filter((version) => {
    //             return version.version === latestVersionId;
    //         })[0];

    //         return {
    //             id, title, version, begin, end, document
    //         };
    //     });
    // }

    getPolicy(id: string) {
        return policies.filter((policy) => {
            return policy.id === id;
        })[0];
    }

    getPolicyVersion(id: string, version: number) {
        const policy = this.getPolicy(id);
        if (!policy) {
            throw new Error(`Policy does not exist ${id}`);
        }

        const policyVersion = policy.versions.filter((ver) => {
            return version === ver.version;
        })[0];
        if (!policyVersion) {
            throw new Error(`Policy version does not exist ${id}.${version}`);
        }

        return policyVersion;
    }

    /**
     * Converts the policy agreements into something more directly usable.
     * 
     * @param policyIds 
     * @returns 
     */
    parsePolicyAgreements(policyIds: Array<UserPolicy>): Array<UserPolicyAgrement> {
        return policyIds.map(({id, agreedon}) => {
            const [policyId, policyVersion] = id.split('.');
            return {
                id: policyId,
                version: parseInt(policyVersion, 10),
                agreedAt: new Date(agreedon)
            };
        });
    }

    // getUseAgreements() {
    //     return this.useAgreements;
    // }

    // async loadUseAgremements() {

    //     // if (!policyIds) {
    //     // const me = await this.auth2Client.getMe(this.authorization);
    //     // const policyIds = me.policyids;
    //     // }

    //     const agreements = this.parsePolicyAgreements(policyIds);
    //     // this.agreements = agreements;

    //     // Now add the policy information to the use agreements
    //     // TODO: ideally the auth service knows about policies themselves!
    //     const useAgreements = agreements.map(({date: agreedAt, id, version}) => {
    //         try {
    //             const {title} = this.getPolicy(id);
    //             const {begin: publishedAt, end: expiredAt} = this.getPolicyVersion(id, version);
    //             return {
    //                 agreedAt, id, version,
    //                 title, publishedAt, expiredAt
    //             };
    //         } catch (ex) {
    //             console.error('Error fetching policy or version, skipped', ex);
    //             return null;
    //         }
    //     })
    //         .filter((useAgreement) => {return !!useAgreement;});

    //     this.useAgreements = useAgreements;
    // }

    getPolicyAgreements(userPolicyAgreements: Array<UserPolicyAgrement>): Array<PolicyAgreement> {
        const now = Date.now();
        return policies.reduce<Array<PolicyAgreement>>((policyAgreements, {id, title, versions}) => {
            versions.forEach((policyVersion) => {
                const document = 'document' in policyVersion ? policyVersion.document : null;
                const url = 'url' in policyVersion ? policyVersion.url : null;
                const {version, begin, end} = policyVersion;
                // Simply gets the agreement time, if present for this user in their
                // "policyids" list.
                const agreedAt = userPolicyAgreements
                    .map(({id: idAgreed, version: versionAgreed, agreedAt}) => {
                        if (idAgreed === id && versionAgreed === version) {
                            return agreedAt;
                        }
                    })
                    .filter((agreedAt) => {
                        return !!agreedAt;
                    })[0] || null;

                // Similar to above, but this is a boolean indicating whether the
                // previous version of the current agreement was agreed to. This is used
                // to differentiate between a totally new policy and a policy which has
                // been updated.
                // TODO: THIS IS WRONG! Fix!
                const previouslyAgreedTo = userPolicyAgreements
                    .some(({id: idAgreed, version: versionAgreed}) => {
                        return (id == idAgreed && version == versionAgreed + 1);
                    });

                const expiredAt = end ? new Date(end) : null;

                const [status, statusSort]: [PolicyAgreementStatus, number] = (() => {
                    if (expiredAt) {
                        if (expiredAt.getTime() <= now) {
                            // We don't care whether it was agreed to or not.
                            return ['expired', 3];
                        }
                        // otherwise, this agreement version has not yet expired and is
                        // still effective.
                    }
                    if (agreedAt) {
                        return ['current', 2];
                    }
                    return [previouslyAgreedTo ? 'updated' : 'new', 1];
                })();

                policyAgreements.push({
                    id, version, title, publishedAt: new Date(begin), expiredAt, agreedAt, status, statusSort,  document, url
                });
            });
            return policyAgreements;
        }, []);
    }

    /**
     * Returns all policies which are "new" -- the user has never agreed to.
     *
     * @returns
     */
    getNewPolicies() {
        return this.policyAgreements
            .filter(({status}) => {
                return ['new', 'updated'].includes(status);
            });
    }
}
