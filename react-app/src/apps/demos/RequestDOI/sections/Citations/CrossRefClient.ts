/**
 * RESTish exceptions
 */


export class RESTHTTPError extends Error {
    statusCode: number;
    constructor({ message, statusCode }: { message: string, statusCode: number }) {
        super(message);
        this.statusCode = statusCode;
    }

    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message
        }
    }
}


/**
 * Cross ref citation typing (wip)
 * NOTE that we only use this for the crossref client, which we only use for development.
 * There are two REST apis - the unversioned which uses crossref data types as defined below,
 * and the v1, which is accessed via the ORCIDLink service, and uses a different data format
 * (application/vnd.citationstyles.csl+json) which is VERY similar to this one, with the only
 * discernable difference so far that some fields (e.g. title) are a list of strings here,
 * and a simple string in the v1 api.
 */

export type CrossRefDocumentTypes = 'journal' | 'report' | 'monograph';

export interface CrossRefAffiliation {

}

export interface CrossRefAuthor {
    ORCID: string
    affiliation: Array<CrossRefAffiliation>
    'authenticated-orcid': boolean;
    family: string;
    given: string;
    sequence: string;
}

export interface CrossRefContentDomain {
    'crossmark-restriction': boolean;
    domain: Array<string>
}

export interface CrossRefTimestamp {
    'date-parts'?: Array<[number, number, number]>
    'date-time'?: string; // ISO 8601
    timestamp?: number // epoch ms
}

export interface CrossRefISSNType {
    type: string;
    value: string;
}

export interface CrossRefJournalIssue {
    issue: string;
    'published-online': CrossRefTimestamp;
}

export interface CrossRefLicense {
    URL: string;
    'content-version': string;
    'delay-in-days': number;
    start: CrossRefTimestamp
}

export interface CrossRefLink {
    URL: string;
    'content-type': string;
    'content-version': string;
    'intended-application': string;
}

export interface CrossRefReference {
    DOI: string;
    'article-title': string;
    author: string;
    'doi-asserted-by': string;
    'first-page': string;
    'journal-title': string;
    key: string;
    volume: string;
    year: string;
}

export interface CrossRefRelation {
    [key: string]: {
        'asserted-by': string;
        id: string;
        'id-type': string;
    }
}

export interface CrossRefResource {
    [key: string]: {
        URL: string
    }
}

export interface CrossRefUpdateTo {
    DOI: string;
    label: string;
    type: string;
    updated: CrossRefTimestamp
}

export interface CrossRefCitation {
    DOI: string
    URL: string
    abstract: string;
    author: Array<CrossRefAuthor>
    'container-title': Array<string>
    'content-domain': CrossRefContentDomain
    created: CrossRefTimestamp
    deposited: CrossRefTimestamp
    editor: Array<CrossRefAuthor>
    indexed: CrossRefTimestamp
    'is-referenced-by-count': number;
    'issn-type': Array<CrossRefISSNType>
    issue: string;
    issued: CrossRefTimestamp
    'journal-issue': CrossRefJournalIssue;
    language: string;
    license: CrossRefLicense;
    link: Array<CrossRefLink>
    member: string;
    'original-title': Array<string>;
    page: string;
    prefix: string;
    published: CrossRefTimestamp;
    'published-online': CrossRefTimestamp;
    publisher: string;
    reference: Array<CrossRefReference>
    'reference-count': number;
    'references-count': number;
    // TODO: skip for now; need to look up, strange structure.
    relation: Array<CrossRefRelation>
    // TODO: skip for now, uses some sort of controlled key, but don't know
    resource: Array<CrossRefResource>
    score: number;
    'short-container-title': Array<string>
    'short-title': Array<string>
    source: string;
    subject: Array<string>
    subitle: Array<string>;
    title: Array<string>;
    type: string;
    'update-policy': string;
    'update-to': Array<CrossRefUpdateTo>
    volume: number;
}

export type CrossRefResponseStatus = 'ok' | 'error';


export interface CrossRefResponseBase {
    status: CrossRefResponseStatus;
}

export interface CrossRefResponseOKBase extends CrossRefResponseBase {
    status: 'ok',
    'message-type': 'work' | 'work-list';
    'message-version': string;
}

export interface CrossRefResponseWork extends CrossRefResponseOKBase {
    'message-type': 'work';
    'message': CrossRefCitation;
}

// TODO: sort out error handling.
// Actually ... is there an error response? It looks like status code + text. Hmm..
export interface CrossRefResponseError extends CrossRefResponseBase {
    status: 'error';
    message: string;
}

export type CrossRefResponse = CrossRefResponseWork | CrossRefResponseError;


export interface CrossRefWorkList {
    facets: any;
    'total-results': number;
    items: Array<CrossRefCitation>
}

export interface GetCitationsForTypeResult extends CrossRefResponseOKBase {
    'message-type': 'work-list',
    message: CrossRefWorkList
}

export type GetCitationsForTypeResponse = GetCitationsForTypeResult | CrossRefResponseError;

export default class CrossRefClient {
    async getCitationsForType(type: string) {
        const response = await (async () => {
            try {
                return fetch(`https://api.crossref.org/types/${type}/works?mailto=eapearson@lbl.gov`, {
                    method: 'GET'
                });

            } catch (ex) {
                console.error('ERROR fetching doi', ex);
                throw new Error('Error fetching citation');
            }
        })();


        const responseText = await response.text();
        if (response.status !== 200) {
            throw new RESTHTTPError({
                statusCode: response.status,
                message: responseText
            });
        }

        const data = JSON.parse(responseText) as unknown as GetCitationsForTypeResponse;
        if (data.status === 'ok') {
            if (data['message-type'] === 'work-list') {
                return data.message;
            } else {
                throw new Error(`Did not receive a correct response; expected work-list, got ${data['message-type']}`);
            }
        } else {
            throw new Error(`Error fetching works: ${data.message}`)
        }
        // TODO: handle errors if ever returned??

    }
    // async getCitation(doi: string) {
    //     const response = await (async () => {
    //         try {
    //             return fetch(`https://api.crossref.org/works/${doi}?mailto=eapearson@lbl.gov`, {
    //                 method: 'GET'
    //                 // headers: {
    //                 //     // 'Accept': 'application/vnd.crossref-api-message+json',
    //                 //     'User-Agent': 'KBase/1.0 (https://kbase.us; mailto:eapearson@lbl.gov)'
    //                 // }
    //             });
    //         } catch (ex) {
    //             console.error('ERROR fetching doi', ex);
    //             throw new Error('Error fetching citation');
    //         }
    //     })();


    //     const responseText = await response.text();
    //     if (response.status !== 200) {
    //         throw new RESTHTTPError({
    //             statusCode: response.status,
    //             message: responseText
    //         });
    //     }

    //     const data = JSON.parse(responseText) as unknown as CrossRefResponse;
    //     if (data.status === 'ok') {
    //         if (data['message-type'] === 'work') {
    //             return data.message;
    //         } else {
    //             throw new Error(`Did not receive a correct response; expected work-list, got ${data['message-type']}`);
    //         }
    //     } else {
    //         throw new Error(`Error fetching works: ${data.message}`)
    //     }
    // }
}
