import policyData from '../resources/agreements/terms-and-conditions.json';

/**
 * These interfaces model the policy data stored in policies.json.
 * Note that this is a long-term stopgap -- the policies should be served
 * up by a service, like the auth service.
 */

export interface PolicyDataVersion {
    version: number;
    publishedAt: string;
    url: string;
}

export interface PolicyData {
    id: string;
    title: string;
    versions: Array<PolicyDataVersion>
}



export interface TermsAndConditionsPolicyVersion {
    version: number;
    publishedAt: Date;
    url: URL;
}

export interface TermsAndConditionsPolicy {
    id: string;
    title: string;
    versions: Array<TermsAndConditionsPolicyVersion>
}

export interface CurrentTermsAndConditionsPolicy {
    id: string;
    title: string;
    version: number;
    publishedAt: Date;
    url: URL;
}

const POLICY: TermsAndConditionsPolicy = {
    id: policyData.id,
    title: policyData.title,
    versions: policyData.versions.map(({ version, publishedAt, url }) => {
        return {
            version, url: new URL(url),
            publishedAt: new Date(publishedAt)
        };
    })
}


export default class Policy {
    _policy: TermsAndConditionsPolicy = POLICY;

    currentPolicy(): CurrentTermsAndConditionsPolicy {
        const now = Date.now();
        let currentVersion: TermsAndConditionsPolicyVersion | null = null;
        for (const policyVersion of this._policy.versions) {
            // If the publication of the T&C is in the future, we are done.
            if (policyVersion.publishedAt.getTime() > now) {
                break;
            }

            // Otherwise, we continue marching through the T&C, bookmarking
            // as we go.

            currentVersion = policyVersion;
        }

        if (!currentVersion) {
            throw new Error('No current T&C policy')
        }

        return {id: this._policy.id, title: this._policy.title, ...currentVersion}
    }

    policy(): TermsAndConditionsPolicy {
        return this._policy;
    }
}
