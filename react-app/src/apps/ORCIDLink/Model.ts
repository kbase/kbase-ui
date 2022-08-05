import { AuthenticationStateAuthenticated } from "contexts/Auth";
import { StaticNarrative } from "lib/clients/StaticNarrative";
import { DynamicServiceClient } from "lib/kb_lib/comm/JSONRPC11/DynamicServiceClient";
import { Config } from "types/config";



const ORCID_APP_ID = "APP-RC3PM3KSMMV3GKWS";

// UI URLS
const START_URL = 'https://ci.kbase.us/services/orcidlink/start';
const LINK_URL = 'https://ci.kbase.us/services/orcidlink/link';
const REVOKE_URL = 'https://ci.kbase.us/services/orcidlink/revoke';
const GET_NAME_URL = 'https://ci.kbase.us/services/orcidlink/get_name';

// Service URLs
const GET_PROFILE_URL = 'https://ci.kbase.us/services/orcidlink/get_profile';
const IS_LINKED_URL = 'https://ci.kbase.us/services/orcidlink/is_linked';
const GET_LINK_URL = 'https://ci.kbase.us/services/orcidlink/get_linked';
const GET_WORK_URL = 'https://ci.kbase.us/services/orcidlink/get_work';
const SAVE_WORK_URL = 'https://ci.kbase.us/services/orcidlink/save_work';
const CREATE_WORK_URL = 'https://ci.kbase.us/services/orcidlink/create_work';
const DELETE_WORK_URL = 'https://ci.kbase.us/services/orcidlink/delete_work';

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

export interface ExternalId {
    type: string;
    value: string;
    url: string;
    relationship: string;
}

export interface Publication {
    putCode: string;
    createdAt: number;
    updatedAt: number;
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
    // TODO: split into profile and info? E.g. id in info, profile info in profile...
    orcidId: string;
    firstName: string;
    lastName: string;
    bio: string;
    affiliations: Array<Affiliation>
    publications: Array<Publication>
}

export interface EditablePublication {
    putCode: string;
    publicationType: string;
    title: string;
    date: string;
    journal: string;
    url: string;
    externalIds: Array<ExternalId>
}

export interface ReturnLink {
    url: string;
    label: string;
}

/*
{
            "orcid_auth": {
                "access_token": "6882fc5b-1185-434f-a309-e364f21a3f9c",
                "token_type": "bearer",
                "refresh_token": "7cb48f8b-f685-4948-9443-2874b2fb2fd3",
                "expires_in": 631138518,
                "scope": "/read-limited openid /activities/update",
                "name": "Erik Pearson",
                "orcid": "0000-0003-4997-3076",
                "id_token": "eyJraWQiOiJzYW5kYm94LW9yY2lkLW9yZy0zaHBnb3NsM2I2bGFwZW5oMWV3c2dkb2IzZmF3ZXBvaiIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiSlJpVjVZVGNmSUdnV3ZuUkpsQklOQSIsImF1ZCI6IkFQUC1SQzNQTTNLU01NVjNHS1dTIiwic3ViIjoiMDAwMC0wMDAzLTQ5OTctMzA3NiIsImF1dGhfdGltZSI6MTY1OTAzMzMyOSwiYW1yIjoicHdkIiwiaXNzIjoiaHR0cHM6XC9cL3NhbmRib3gub3JjaWQub3JnIiwiZXhwIjoxNjU5MTE5NzMwLCJnaXZlbl9uYW1lIjoiRXJpayIsImlhdCI6MTY1OTAzMzMzMCwiZmFtaWx5X25hbWUiOiJQZWFyc29uIiwianRpIjoiMjJhOWRmOGYtN2E0ZC00N2RmLTk3NjItNzNkZDVjZjhmZWNkIn0.FaH1s2Wl6TV5I7y1AKNgt4w2lpYMXbDild4qd8Vnovg5l20oXc7HhgrwcpJj_nwJUGKe80PWetzD5tQ6Ayq-eUOnLMIEkLreCLCSjg2UiBiI5O0Y2fTu43dFKSBK6zmiYcbOSj6WeFC7-537OpF9d2oNEjqDREU_1eyXJ9GZFXS8apRGPgcqAGHq1nSH2c12MkFbg_IZPwUU0zsmrxLWCo7i_g_wc-GePMA9a2gu-kLaY-1kmQlvOm17GSaDoJR3dOMR2dOLuR6Zn8dcWv28xZi33jsrQcgLpSX6UsyAJyLdYV-JQNBGlbPKSd_7ab9mEMWoOtjYTPmONvDJbMcjPw"
            },
            "created_at": 1659033343893
        }
*/


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

export type GetProfileResult = {
    result: ORCIDProfile
};


export class Model {
    config: Config;
    auth: AuthenticationStateAuthenticated;

    constructor({ config, auth }: { config: Config, auth: AuthenticationStateAuthenticated }) {
        this.config = config;
        this.auth = auth;
    }

    async getProfile(): Promise<ORCIDProfile> {
        const response = await fetch(GET_PROFILE_URL, {
            headers: {
                authorization: this.auth.authInfo.token
            }
        });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as GetProfileResult;
        return result.result;
    }
    
    async isLinked(): Promise<boolean> {
        const response = await fetch(`${IS_LINKED_URL}`, {
            headers: {
                authorization: this.auth.authInfo.token
            }
        });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: boolean };
        return result.result;
    }
    
    async getLink(): Promise<LinkRecord | null> {
        const response = await fetch(`${GET_LINK_URL}`, {
            headers: {
                authorization: this.auth.authInfo.token
            }
        });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: LinkRecord | null};
        return result.result;
    }

    async getWork(putCode: string): Promise<Publication> {
        const response = await fetch(`${GET_WORK_URL}/${putCode}`, {
            headers: {
                authorization: this.auth.authInfo.token
            }
        });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: Publication };
        return result.result;
    }

    async saveWork(work: EditablePublication): Promise<Publication> {
        console.log('saving work', work);
        const temp = {
            putCode: work.putCode,
            title: work.title,
            date: work.date,
            publicationType: work.publicationType,
            journal: work.journal,
            url: work.url,
            externalIds: work.externalIds
        };
        console.log('saving', temp);
        const response = await fetch(SAVE_WORK_URL, {
            method: 'PUT',
            headers: {
                Authorization: this.auth.authInfo.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(temp)
        });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: Publication };
        return result.result;
    }

    async createWork(work: EditablePublication): Promise<Publication> {
        console.log('saving work', work);
        const temp = {
            title: work.title,
            date: work.date,
            publicationType: work.publicationType,
            journal: work.journal,
            url: work.url,
            externalIds: work.externalIds
        };
        console.log('saving', temp);
        const response = await fetch(CREATE_WORK_URL, {
            method: 'POST',
            headers: {
                Authorization: this.auth.authInfo.token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(temp)
        });

        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }

        const result = JSON.parse(await response.text()) as { result: Publication };
        return result.result;
    }

    async deleteWork(putCode: string): Promise<void> {
        const response = await fetch(`${DELETE_WORK_URL}/${putCode}`, {
            method: 'DELETE',
            headers: {
                Authorization: this.auth.authInfo.token,
                'Content-Type': 'application/json'
            }
        });
        if (response.status !== 200) {
            throw new Error(`Unexpected response: ${response.status}`);
        }
        return;
    }

     publicationToEditablePublication(publication: Publication): EditablePublication {
         const { putCode, publicationType, title, date, journal, url, externalIds } = publication;
         console.log('CONVERTING', publication);
        return {
            putCode,
            publicationType, title, date, journal: journal || '', url: url || '',
            externalIds: externalIds || []
        }
     }
    
    async getEditableWork(putCode: string): Promise<EditablePublication> {
        const work = await this.getWork(putCode);
        return this.publicationToEditablePublication(work);
    }

    // async getStaticNarrative(staticNarrativeId: string) {
    //     const client = new StaticNarrative({
    //         url: this.config.services.ServiceWizard.url,
    //         timeout: 10000,
    //         token: this.auth.authInfo.token
    //     });
    //     return client.get_static_narrative_info(static)
    // }
}
