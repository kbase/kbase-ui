import { StaticNarrativeSummary } from "apps/demos/RequestDOI/Model";
import { ImportableAuthor } from "apps/demos/RequestDOI/sections/AuthorsImport/editor/AuthorsImportSectionController";
import { ObjectInfo, WorkspaceInfo } from "lib/kb_lib/comm/coreServices/Workspace";
import { toJSON } from "lib/kb_lib/jsonLike";
import { MultiServiceClient } from "./DynamicServiceClient";
import { CitationSource, LinkingSessionInfo, LinkRecord } from "./Model";


const WORKS_PATH = 'works';


const GET_PROFILE_PATH = 'profile';
const IS_LINKED_PATH = 'is_linked';
const GET_LINK_PATH = 'link';

const LINKING_SESSIONS_PATH = 'linking-sessions';
const START_LINKING_SESSION_PATH = 'start-linking-session';
const FINISH_LINKING_SESSION_PATH = 'finish-linking-session';

const LINK_PATH = 'link';

const DOI_FORMS_PATH = 'doi_forms/forms';

const ADMIN_GET_DOI_APPLICATIONS_PATH = 'doi_forms/admin/forms';
const ADMIN_GET_DOI_REQUESTS_PATH = 'doi_forms/admin/requests';

const DOI_METADATA = 'doi/metadata';
const DOI_CITATION = 'doi/citation';

const SUBMIT_DOI_REQUEST_PATH = 'demos/doi_request'

// ORCID User Profile (our version)


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

export interface ORCIDProfile {
    // TODO: split into profile and info? E.g. id in info, profile info in profile...
    orcidId: string;
    firstName: string;
    lastName: string;
    bio: string;
    affiliations: Array<Affiliation>
    works: Array<Work>
    emailAddresses: Array<string>
}

// 

export interface CreateLinkingSessionResult {
    session_id: string
}

export interface NewWork {
    title: string;
    journal: string;
    date: string;
    workType: string;
    url: string;
    externalIds: Array<ExternalId>
}

export interface Work extends NewWork {
    putCode: string;
    createdAt: number;
    updatedAt: number;
    source: string;
}

export interface WorkUpdate extends NewWork {
    putCode: string;
}

export interface GetNameResult {
    firstName: string;
    lastName: string;
}


export interface ORCIDLinkResult {
    orcidLink: {
        orcidId: string | null
    }
}

// DOI FORM


export interface ContractNumbersResults {
    contractNumbers: ContractNumbers
}

export interface ContractNumbers {
    doe: Array<string>;
    other: Array<string>
}

// GEOLOCATION

// export interface GeolocationDataResults {
//     geolocationData: GeolocationData;
// }


export enum LocationType {
    POINT = 'POINT',
    POLYGON = 'POLYGON',
    BOUNDING_BOX = 'BOUNDING_BOX'
}

export interface LocationBase {
    type: LocationType;
    place: string;
}

export interface LatLong {
    latitude: number;
    longitude: number;
}

export interface LocationPoint extends LocationBase {
    type: LocationType.POINT,
    point: LatLong
}

export interface LocationPolygon extends LocationBase {
    type: LocationType.POLYGON,
    polygon: Array<LatLong>
}

export interface BoundingBox {
    westLongitude: number,
    southLatitude: number
    eastLongitude: number,
    northLatitude: number,
}

export interface LocationBoundingBox extends LocationBase {
    type: LocationType.BOUNDING_BOX,
    boundingBox: BoundingBox
}

export type Location =
    LocationPoint |
    LocationPolygon |
    LocationBoundingBox;

export interface GeolocationData {
    locations: Array<Location>
}

// DESCRIPTION

export interface DescriptionResults {
    description: Description;
}

export interface Description {
    title: string;
    keywords: Array<string>;
    abstract: string;
    researchOrganization: string;
}

export interface DescriptionParams {
    narrativeTitle: string;
}

// Final submission data

export type ContributorType = string;

export interface OSTIAuthor {
    first_name: string,
    middle_name?: string;
    last_name: string;
    affiliation_name?: string;
    private_email: string;
    orcid_id?: string;
    contributor_type: ContributorType;
}

export interface OSTIRelatedIdentifier {
    related_identifier: string;
    relation_type: string;
    related_identifier_type: string;
}

export interface OSTISubmission {
    title: string;                  // Full title of the dataset, with version numbers and date ranges if applicable.
    publication_date: string;   // The dataset publication date, in mm/dd/yyyy, yyyy, or yyyy Month format.
    contract_nos: string        // Primary DOE contract number(s), multiple values may be separated by semicolon.
    othnondoe_contract_nos?: string; // Any non-DOE award numbers associated with this data set.
    authors: Array<OSTIAuthor>  // Detailed set of information for person(s) responsible for creation of the dataset 
    //  content.Allows transmission of ORCID information and more detailed affiliations
    //  (see below).MAY NOT be used in the same record as the string format, <creators>.
    site_url: string;           // Full URL to the "landing page" for this data set
    dataset_type: string;       // Type of the main content of the dataset.
    site_input_code?: string;   // The Site Code that owns this particular data set; will default to logged-in user's 
    //  primary Site if not set.User must have appropriate privileges to submit records 
    //  to this Site.
    keywords?: string;          // Words or phrases relevant to this data set. Multiple values may be separated by 
    //  a semicolon and a following space.
    description?: string;       // A short description or abstract
    related_identifiers?: Array<OSTIRelatedIdentifier>; // Set of related identifiers for this data
    doi_infix?: string;         // If present, the site-selected DOI inset value for new DOIs.
    // accession_num?: string;     // Site specific unique identifier for this data set.
    sponsor_org: string;       // If credited, the organization name that sponsored / funded the research. For a list 
    //  of sponsor organizations, see Sponsoring Organization Authority at 
    //  https://www.osti.gov/elink/authorities.jsp. Multiple codes may be semi-colon delimited.
    originating_research_org?: string;  // If credited, the organization name primarily responsible for conducting the research
}

/*
 hidden: str = Field(...)
    osti_id: str = Field(...)
    status: str = Field(...)
    related_resource: str | None = Field(None)
    product_nos: str | None = Field(None)
    product_type: str = Field(...)
    other_identifying_numbers: str | None = Field(None)
    availability: str | None = Field(None)
    collaboration_names: str | None = Field(None)
    language: str = Field(...)
    country: str = Field(...)
    subject_categories_code: str | None = Field(None)
    # Should be static narrative ref? wsid/version or wsid.version
    accession_num: str | None = Field(...)
    # Note string "none" if pending
    date_first_submitted: str = Field(...)
    date_last_submitted: str = Field(...)
    entry_date: str = Field(...)
    doi: str = Field(...)
    doi_status: str = Field(...)
    file_extension: str | None = Field(None)
    # should be web browser?
    software_needed: str | None = Field(None)
    dataset_size: str | None = Field(None)
    contact_name: str = Field(...)
    contact_org: str = Field(...)
    contact_email: str = Field(...)
    othnondoe_contract_nos: str | None = Field(...)
    # NB the leading "@" replaced with "_" for Python class compatibility
    _status: str = Field(...)
    _released: str = Field(...)
*/
export interface OSTIRecord extends OSTISubmission {
    osti_id: string;
    status: string;
    related_resource: string | null;
    product_nos: string | null;
    product_type: string;
    other_identifying_numbers: string | null;
    availability: string | null;
    collaboration_names: string | null;
    language: string;
    country: string;
    subject_categories_code: string | null;
    accession_num: string | null;
    date_first_submitted: string;
    date_last_submitted: string;
    entry_date: string;
    doi: string;
    doi_status: string;
    file_extension: string | null;
    software_needed: string | null;
    dataset_size: string | null;
    contact_name: string;
    contact_org: string;
    contact_email: string;
    othnodoe_conteract_nos: string | null;
    _status: string;
    _released: string;

}

export interface ReviewAndSubmitResult {
    // submissfion: OSTISubmission
    formId: string;
    requestId: string
}

export interface ReviewAndSubmitParams {
    formId: string;
    submission: OSTISubmission
}

// In the end, all we can use for citations are
// the DOI.

// CITATION IMPORT

export interface CitationImportParams {
    staticNarrative: StaticNarrativeSummary
}

export interface Citation {
    doi: string;
    citation: string;
    source: CitationSource;
}

export interface CitationImportResults {
    citations: Array<Citation>
}

// CITATIONS (edit imported, manual)

export interface CitationParams {
    citations: Array<Citation>
}

export interface CitationResults {
    citations: Array<Citation>
}

export interface NarrativeInfo {
    objectInfo: ObjectInfo
    workspaceInfo: WorkspaceInfo
}

export interface NarrativeSelectionResult {
    staticNarrative: StaticNarrativeSummary
}

// export interface MinimalNarrativeInfo {
//     workspaceId: number;
//     objectId: number;
//     version: number;
//     ref: string;
//     title: string;
//     owner: string;
// }


// see: https://www.osti.gov/elink/241-6api.jsp#record-model-creators
export interface Author {
    firstName: string;
    middleName?: string;
    lastName: string;
    emailAddress: string;
    orcidId?: string;
    institution?: string;
    contributorType: ContributorType;
}

export enum StepStatus {
    NONE = 'NONE',
    INCOMPLETE = 'INCOMPLETE',
    COMPLETE = 'COMPLETE',
    EDITING = 'EDITING'
}

export interface StepStateBase {
    status: StepStatus
}

export interface StepStateNone extends StepStateBase {
    status: StepStatus.NONE;
}

export interface StepStateIncomplete<P> extends StepStateBase {
    status: StepStatus.INCOMPLETE;
    params: P;
}

export interface StepStateComplete<P, R> extends StepStateBase {
    status: StepStatus.COMPLETE;
    params: P;
    value: R;
}

export interface StepStateEditing<P, R> extends StepStateBase {
    status: StepStatus.EDITING;
    params: P;
    value: R;
}

export type StepState<P, R> =
    StepStateNone |
    StepStateIncomplete<P> |
    StepStateComplete<P, R> |
    StepStateEditing<P, R>;


// export type STEPS3 = [
//     StepState<null, NarrativeSelectionResult>,
//     StepState<null, CitationResults>,
//     StepState<null, ORCIDLinkResult>,
//     StepState<{ narrativeTitle: string }, { title: string, author: Author }>,
//     StepState<null, ContractNumbersResults>,
//     StepState<null, GeolocationDataResults>,
//     StepState<null, DescriptionResults>,
//     StepState<ReviewAndSubmitParams, ReviewAndSubmitData>
// ]

export interface AuthorsSectionParams {
    authors: Array<ImportableAuthor>
}

export interface AuthorsSectionResult {
    authors: Array<Author>
}

export type NarrativeSection = StepState<null, NarrativeSelectionResult>;
export type CitationsImportSection = StepState<CitationImportParams, CitationImportResults>;
export type CitationsSection = StepState<CitationParams, CitationResults>;
export type ORCIDLinkSection = StepState<null, ORCIDLinkResult>;
export type AuthorsImportSection = StepState<{ staticNarrative: StaticNarrativeSummary }, { authors: Array<ImportableAuthor> }>;
export type AuthorsSection = StepState<AuthorsSectionParams, AuthorsSectionResult>;
export type ContractsSection = StepState<null, ContractNumbersResults>;
// export type GeolocationSection = StepSftate<null, GeolocationDataResults>;
export type DescriptionSection = StepState<DescriptionParams, DescriptionResults>;
export type ReviewAndSubmitSection = StepState<ReviewAndSubmitParams, ReviewAndSubmitResult>;

export interface DOIFormSections {
    narrative: NarrativeSection;
    citationsImport: CitationsImportSection;
    citations: CitationsSection;
    orcidLink: ORCIDLinkSection;
    authorsImport: AuthorsImportSection;
    authors: AuthorsSection;
    contracts: ContractsSection;
    // geolocation: GeolocationSection
    description: DescriptionSection
    reviewAndSubmit: ReviewAndSubmitSection;
}

export interface InitialDOIForm {
    sections: DOIFormSections;
    status: DOIFormStatus;
}

export enum DOIFormStatus {
    INCOMPLETE = "INCOMPLETE",
    COMPLETE = "COMPLETE",
    SUBMITTED = "SUBMITTED"
}

export interface DOIForm {
    form_id: string;
    owner: string;
    created_at: number;
    updated_at: number;
    status: DOIFormStatus;
    sections: DOIFormSections
}

export interface DOIRequestRecord {

}

export interface DOIFormUpdate {
    form_id: string;
    status: DOIFormStatus;
    sections: DOIFormSections
}


export interface DeleteWorkResult {
    ok: true
}

export interface JournalAbbreviation {
    title: string;
    abbreviation: string
}

export interface GetDOICitationResult {
    citation: string;
}

export interface SubmitDOIRequestParams {
    form_id: string;
    submission: OSTISubmission
}

export interface SubmitDOIRequestResult {
    request_id: string;
}

export interface AdminGetDOIRequestsResult {
    username: string;
    request_id: string;
    request: {
        params: {
            submission: OSTISubmission
        },
        at: string
    },
    response: {
        response: {
            record: OSTIRecord
        },
        at: string
    }
}
// export interface GetDOIMetadata {
//     metadata: CSLMetadata
// }

export class ORCIDLinkServiceClient extends MultiServiceClient {
    module = 'ORCIDLink';

    async getProfile(): Promise<ORCIDProfile> {
        return await this.get<ORCIDProfile>(`${GET_PROFILE_PATH}`)
    }

    async isLinked(): Promise<boolean> {
        return this.get<boolean>(`${GET_LINK_PATH}`)
    }

    async getLink(): Promise<LinkRecord | null> {
        return await this.get<LinkRecord | null>(`${GET_LINK_PATH}`)
    }

    async deleteLink(): Promise<LinkRecord | null> {
        return await this.delete<LinkRecord | null>(`${LINK_PATH}`)
    }

    // ORICD Account works

    async getWork(putCode: string): Promise<Work> {
        return await this.get<Work>(`${WORKS_PATH}/${putCode}`)
    }

    async saveWork(work: WorkUpdate): Promise<Work> {
        return await this.put<Work>(`${WORKS_PATH}`, toJSON(work))
    }

    async createWork(work: NewWork): Promise<Work> {
        return await this.post<Work>(`${WORKS_PATH}`, toJSON(work))
    }

    async deleteWork(putCode: string): Promise<DeleteWorkResult> {
        return await this.delete<DeleteWorkResult>(`${WORKS_PATH}/${putCode}`);
    }

    // async getName(): Promise<GetNameResult> {
    //     return await this.get<GetNameResult>(`${GET_NAME_PATH}`)
    // }

    async getDOIApplication(formId: string): Promise<DOIForm> {
        return await this.get<DOIForm>(`${DOI_FORMS_PATH}/${formId}`)
    }

    async deleteDOIApplication(formId: string): Promise<void> {
        return await this.delete<void>(`${DOI_FORMS_PATH}/${formId}`)
    }

    async getDOIApplications(): Promise<Array<DOIForm>> {
        return await this.get<Array<DOIForm>>(DOI_FORMS_PATH)
    }

    async createDOIApplication(doiForm: InitialDOIForm): Promise<DOIForm> {
        return await this.post<DOIForm>(`${DOI_FORMS_PATH}`, toJSON(doiForm))
    }

    async saveDOIApplication(doiForm: DOIFormUpdate): Promise<DOIForm> {
        return await this.put<DOIForm>(`${DOI_FORMS_PATH}`, toJSON(doiForm))
    }

    // DOI Request Admin

    async adminGetDOIApplications(): Promise<Array<DOIForm>> {
        return await this.get<Array<DOIForm>>(ADMIN_GET_DOI_APPLICATIONS_PATH)
    }

    async adminGetDOIRequests(): Promise<Array<AdminGetDOIRequestsResult>> {
        return await this.get<Array<AdminGetDOIRequestsResult>>(ADMIN_GET_DOI_REQUESTS_PATH)
    }

    // Linking Sessions

    async createLinkingSession(): Promise<CreateLinkingSessionResult> {
        return await this.post<CreateLinkingSessionResult>(`${LINKING_SESSIONS_PATH}`)
    }

    async getLinkingSession(sessionId: string): Promise<LinkingSessionInfo> {
        return await this.get<LinkingSessionInfo>(`${LINKING_SESSIONS_PATH}/${sessionId}`)
    }

    async deletelLinkingSession(token: string): Promise<void> {
        return await this.delete<void>(`${LINKING_SESSIONS_PATH}/${token}`);
    }

    // Not REST?

    async finishLink(sessionId: string): Promise<void> {
        return await this.post<void>(FINISH_LINKING_SESSION_PATH, {
            session_id: sessionId
        });
    }

    // DOI metadata and citation, proxying essentially to doi.org

    async getDOICitation(doi: string): Promise<GetDOICitationResult> {
        return await this.get<GetDOICitationResult>(DOI_CITATION, {
            doi
        });
    }

    // async getDOIMetadata(doi: string): Promise<CSLMetadata> {
    //     return await this.get<CSLMetadata>(DOI_CITATION, {
    //         doi
    //     });
    // }


    // Journals

    // async getJournalAbbreviation(title: string): Promise<Array<JournalAbbreviation>> {
    //     return await this.get<Array<JournalAbbreviation>>(JOURNALS_FIND_PATH, {
    //         title
    //     });
    // }


    // async getJournalAbbreviations(titles: Array<string>): Promise<Array<JournalAbbreviation>> {
    //     const titleParams: SearchParams2 = titles.map((title) => {
    //         return ['title', title];
    //     })
    //     return await this.get2<Array<JournalAbbreviation>>(JOURNALS_ABBREVIAIONS_PATH, titleParams);
    // }

    // OSTI DOI Submission
    async submitDOIRequest(params: SubmitDOIRequestParams) {
        return await this.post2<SubmitDOIRequestParams, SubmitDOIRequestResult>(SUBMIT_DOI_REQUEST_PATH, params);
    }
}
