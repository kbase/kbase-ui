import { UserPolicy } from "lib/kb_lib/Auth2";
import Policy, { CurrentTermsAndConditionsPolicy } from "./Policy";

// import policyData from '../resources/agreements/terms-and-conditions.json';

// const POLICY = policyData as unknown as Policy;

/**
 * These interfaces model the policy data stored in policies.json.
 * Note that this is a long-term stopgap -- the policies should be served
 * up by a service, like the auth service.
 */

// export interface PolicyVersion {
//     version: number;
//     begin: string;
//     url: string;
//     end?: string;
// }

// export interface PolicyVersionWithDocument extends PolicyVersionBase {
//     document: string;
// }

// export interface PolicyVersionWithURL extends PolicyVersionBase {
//     url: string;
// }

// export type PolicyVersion = PolicyVersionWithDocument | PolicyVersionWithURL;

// export interface Policy {
//     id: string;
//     title: string;
//     versions: Array<PolicyVersion>
// }

// export type Policy = Array<PolicyVersion>;

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

// export interface PolicyAgreement {
//     id: string;
//     version: number;
//     title: string;
//     publishedAt: Date;
//     expiredAt: Date | null;
//     agreedAt: Date | null;
//     status: PolicyAgreementStatus;
//     statusSort: number;
//     url: URL;
// }

export interface PolicyAgreement {
    currentPolicy: CurrentTermsAndConditionsPolicy;
    agreement: UserPolicyAgrement | null;
    hasPreviousAgreements: boolean;
}

/**
 * A policy agreement that only exists in memory - it is not committed to the user's
 * account yet so does not have an "agreed at" timestamp. This is the form that is
 * submitted to the auth service to signify an agreement to the indicated policy and version.
 * 
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
    policyids: Array<UserPolicy>;  // from the auth service user record
}

export default class PolicyAndAgreement {
    policy: Policy = new Policy();
    userAgreements: Array<UserPolicyAgrement>
    // policyAgreements: Array<PolicyAgreement>;
    constructor({policyids}: PolicyAndAgreementParams) {
        this.userAgreements = this.parsePolicyAgreements(policyids);
        // this.policyAgreements = this.getPolicyAgreements(this.userAgreements);
    }

    // getPolicy(id: string) {
    //     return policies.filter((policy) => {
    //         return policy.id === id;
    //     })[0];
    // }

    // getPolicyVersion(id: string, version: number) {
    //     const policy = this.getPolicy(id);
    //     if (!policy) {
    //         throw new Error(`Policy does not exist ${id}`);
    //     }

    //     const policyVersion = policy.versions.filter((ver) => {
    //         return version === ver.version;
    //     })[0];
    //     if (!policyVersion) {
    //         throw new Error(`Policy version does not exist ${id}.${version}`);
    //     }

    //     return policyVersion;
    // }

    /**
     * Converts the policy agreements (from a user's account) into something more directly usable.
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

    /**
     * Gets a list of "policy agreements" which are aligned to the current set of user
     * agreements (as defined in "terms-and-conditions.json").
     * 
     * Note: Ideally, this logic would reside in the auth service.
     * 
     * @param userPolicyAgreements 
     * @returns 
     */
    // getPolicyAgreements(userPolicyAgreements: Array<UserPolicyAgrement>): Array<PolicyAgreement> {
    //     const now = Date.now();
    //     const agreements: Array<PolicyAgreement> = [];
    //     const policy = this.policy.policy();
    //     // return POLICY.reduce<Array<PolicyAgreement>>((policyAgreements, {begin, end, version, url}) => {
    //     policy.versions.forEach(({begin, end, version, url}) => {
    //             // const document = 'document' in policyVersion ? policyVersion.document : null;
    //             // const url = 'url' in policyVersion ? policyVersion.url : null;
    //             // const {version, begin, end} = policyVersion;
    //             // Simply gets the agreement time, if present for this user in their
    //             // "policyids" list.
    //             const agreedAt = userPolicyAgreements
    //                 .map(({id: idAgreed, version: versionAgreed, agreedAt}) => {
    //                     if (idAgreed === policy.id && versionAgreed === version) {
    //                         return agreedAt;
    //                     }
    //                 })
    //                 .filter((agreedAt) => {
    //                     return !!agreedAt;
    //                 })[0] || null;

    //             // Similar to above, but this is a boolean indicating whether the
    //             // previous version of the current agreement was agreed to. This is used
    //             // to differentiate between a totally new policy and a policy which has
    //             // been updated.
    //             const previouslyAgreedTo = userPolicyAgreements
    //                 .some(({id: idAgreed, version: versionAgreed}) => {
    //                     return (policy.id == idAgreed && version < versionAgreed);
    //                 });

    //             const expiredAt = end ? new Date(end) : null;

    //             const [status, statusSort]: [PolicyAgreementStatus, number] = (() => {
    //                 if (expiredAt) {
    //                     if (expiredAt.getTime() <= now) {
    //                         // We don't care whether it was agreed to or not.
    //                         return ['expired', 3];
    //                     }
    //                     // otherwise, this agreement version has not yet expired and is
    //                     // still effective.
    //                 }
    //                 if (agreedAt) {
    //                     return ['current', 2];
    //                 }
    //                 return [previouslyAgreedTo ? 'updated' : 'new', 1];
    //             })();

    //             agreements.push({
    //                 id: policy.id, version, title: policy.title, 
    //                 publishedAt: new Date(begin), expiredAt, agreedAt, 
    //                 status, statusSort,  url
    //             });
    //         });
    //         return agreements;
    // }

    /**
     * Returns all policies which are "new" -- the user has never agreed to.
     *
     * @returns
     */
    // getNewPolicies() {
    //     return this.policyAgreements
    //         .filter(({status}) => {
    //             return ['new', 'updated'].includes(status);
    //         });
    // }

     /**
     * Returns the current active policy, and whether the user has agreed to it yet or not.
     *
     * @returns
     */
     getPolicyAgreement(): PolicyAgreement {
        const currentPolicy = this.policy.currentPolicy();

        const agreements = this.userAgreements
            .filter(({id, version}) => {
                return (currentPolicy.id === id && currentPolicy.version === version);
            });

        return {
            currentPolicy: currentPolicy,
            agreement: agreements.length > 0 ? agreements[0] : null,
            hasPreviousAgreements: this.userAgreements.length > 0
        }

        // policy.versions.forEach(({begin, end, version, url}) => {
        //         // const document = 'document' in policyVersion ? policyVersion.document : null;
        //         // const url = 'url' in policyVersion ? policyVersion.url : null;
        //         // const {version, begin, end} = policyVersion;
        //         // Simply gets the agreement time, if present for this user in their
        //         // "policyids" list.
        //         const agreedAt = userPolicyAgreements
        //             .map(({id: idAgreed, version: versionAgreed, agreedAt}) => {
        //                 if (idAgreed === policy.id && versionAgreed === version) {
        //                     return agreedAt;
        //                 }
        //             })
        //             .filter((agreedAt) => {
        //                 return !!agreedAt;
        //             })[0] || null;

        //         // Similar to above, but this is a boolean indicating whether the
        //         // previous version of the current agreement was agreed to. This is used
        //         // to differentiate between a totally new policy and a policy which has
        //         // been updated.
        //         const previouslyAgreedTo = userPolicyAgreements
        //             .some(({id: idAgreed, version: versionAgreed}) => {
        //                 return (policy.id == idAgreed && version < versionAgreed);
        //             });

        //         const expiredAt = end ? new Date(end) : null;

        //         const [status, statusSort]: [PolicyAgreementStatus, number] = (() => {
        //             if (expiredAt) {
        //                 if (expiredAt.getTime() <= now) {
        //                     // We don't care whether it was agreed to or not.
        //                     return ['expired', 3];
        //                 }
        //                 // otherwise, this agreement version has not yet expired and is
        //                 // still effective.
        //             }
        //             if (agreedAt) {
        //                 return ['current', 2];
        //             }
        //             return [previouslyAgreedTo ? 'updated' : 'new', 1];
        //         })();

        //         agreements.push({
        //             id: policy.id, version, title: policy.title, 
        //             publishedAt: new Date(begin), expiredAt, agreedAt, 
        //             status, statusSort,  url
        //         });
        //     });
        //     return agreements;
    }
}
