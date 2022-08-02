export interface ORCIDAuth {
    access_token: string,
    expires_in: number,
    name: string,
    orcid: string,
    scope: string
}

export interface LinkRecord {
    created_at: number,
    orcid_auth: ORCIDAuth
}

export interface TempLinkRecord {
    token: string;
    created_at: number;
    expires_at: number;
    orcid_auth: ORCIDAuth;
}

export interface Affiliation {
    name: string;
    role: string;
    startYear: string;
    endYear: string | null;
}

export interface PublicationID {
    type: string;
    value: string;
    url: string;
}

export interface ExternalId {
    type: string;
    value: string;
    url: string;
}

export interface Publication {
    putCode: string;
    createdAt: number;
    updatedAt: number;
    ids: Array<PublicationID>
    source: string;
    title: string;
    journal: string;
    date: string;
    publicationType: string;
    url: string;
    // citation
    citationType: string;
    citation: string;
    citationDescription: string;
    externalIds: Array<ExternalId>
}

export interface ORCIDProfile {
    firstName: string;
    lastName: string;
    bio: string;
    affiliations: Array<Affiliation>
    publications: Array<Publication>
}


export const ORCID_URL = 'https://sandbox.orcid.org';


export type SCOPE = '/read-limited' | '/activities/update' | 'openid';

const SCOPE_USER = 'KBase';

export const SCOPE_HELP: { [K in SCOPE]: { label: string, orcid: { label: string, tooltip: string }, help: Array<string> } } = {
    'openid': {
        label: 'Open ID',
        orcid: {
            label: `Allow ${SCOPE_USER} to get your ORCID® iD.`,
            tooltip: `Allow ${SCOPE_USER} to get your 16-character ORCID® ID and read information on your ORCID® record you have marked as public.`
        },
        help: [
            'KBase uses this when you sign in to KBase via ORCID®'
        ]
    },
    '/read-limited': {
        label: 'Read Limited',
        orcid: {
            label: `Allow ${SCOPE_USER} to read your information with visibility set to Trusted Organizations.`,
            tooltip: `Allow ${SCOPE_USER} to read any information from your record you have marked as \
            limited access. ${SCOPE_USER} cannot read information you have marked as private.`
        },
        help: [
            'KBase uses this to pre-fill certain forms with information in your ORCID® profile'
        ]
    },
    '/activities/update': {
        label: 'Update Activities',
        orcid: {
            label: `Allow ${SCOPE_USER} to add/update your research activities (works, affiliations, etc).`,
            tooltip: `Allow ${SCOPE_USER} to add information about your research activites \
            (for example, works, affiliations) that is stored in the ${SCOPE_USER} system(s) to your \
            ORCID record. ${SCOPE_USER} will also be able to update this and any other information \
            ${SCOPE_USER} have added, but will not be able to edit information added by you or \
            any other trusted organization.`
        },
        help: [
            'KBase uses this to assist you in linking published Narratives to your ORCID® account.'
        ]
    }
}

const ORCID_APP_ID = "APP-RC3PM3KSMMV3GKWS";
