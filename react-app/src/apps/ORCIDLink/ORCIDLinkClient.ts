import { ObjectInfo, WorkspaceInfo } from "lib/kb_lib/comm/coreServices/Workspace";
import { toJSON } from "lib/kb_lib/jsonLike";
import { MultiServiceClient } from "./DynamicServiceClient";
import { LinkingSessionInfo, LinkRecord } from "./Model";


const GET_WORK_PATH = 'work';
const SAVE_WORK_PATH = 'work';
const CREATE_WORK_PATH = 'work';
const DELETE_WORK_PATH = 'delete_work';



const GET_PROFILE_PATH = 'profile';
const IS_LINKED_PATH = 'is_linked';
const GET_LINK_PATH = 'link';

const CREATE_LINKING_SESSION_PATH = 'create-linking-session';
const START_LINKING_SESSION_PATH = 'start-linking-session';
const FINISH_LINKING_SESSION_PATH = 'finish-linking-session';
const CANCEL_LINKING_SESSION_PATH = 'cancel-linking-session';
const GET_LINKING_SESSION_INFO_PATH = 'get-linking-session-info';


const LINK_PATH = 'link';
const REVOKE_PATH = 'revoke';
// const GET_NAME_PATH = 'name';

const CREATE_DOI_APPLICATION_PATH = 'demos/doi_application';
const SAVE_DOI_APPLICATION_PATH = 'demos/doi_application';
const GET_DOI_APPLICATION_PATH = 'demos/doi_application';
const DELETE_DOI_APPLICATION_PATH = 'demos/doi_application';
const GET_DOI_APPLICATIONS_PATH = 'demos/doi_applications';

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
    emailAddresses: Array<string>
}

// 

export interface CreateLinkingSessionResult {
    session_id: string
}

export interface Work {
    title: string;
    journal: string;
    date: string;
    publicationType: string;
    url: string;
    externalIds: Array<ExternalId>
}

export interface WorkUpdate extends Work {
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

export interface GeolocationDataResults {
    geolocationData: GeolocationData;
}

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
    keywords: Array<string>;
    abstract: string
}

// Final submission data

export type ContributorType = string;

export interface OSTIAuthor {
    first_name: string,
    middle_name: string;
    last_name: string;
    affiliation_name: string;
    private_email: string;
    orcid_id: string;
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
    accession_num?: string;     // Site specific unique identifier for this data set.
    sponsor_org?: string;       // If credited, the organization name that sponsored / funded the research. For a list 
    //  of sponsor organizations, see Sponsoring Organization Authority at 
    //  https://www.osti.gov/elink/authorities.jsp. Multiple codes may be semi-colon delimited.
    originating_research_org?: string;  // If credited, the organization name primarily responsible for conducting the research
}

export interface ReviewAndSubmitData {
    submission: OSTISubmission
}

export interface ReviewAndSubmitParams {
    submission: OSTISubmission
}

// In the end, all we can use for citations are
// the DOI.
export interface CitationResults {
    citations: Array<string>
}

export interface NarrativeInfo {
    objectInfo: ObjectInfo
    workspaceInfo: WorkspaceInfo
}

export interface NarrativeSelectionResult {
    narrativeInfo: MinimalNarrativeInfo
}

export interface MinimalNarrativeInfo {
    workspaceId: number;
    objectId: number;
    version: number;
    ref: string,
    title: string
}

export interface Author {
    firstName: string;
    middleName: string;
    lastName: string;
    emailAddress: string;
    orcidId: string;
    institution: string;
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


export type STEPS3 = [
    StepState<null, NarrativeSelectionResult>,
    StepState<null, CitationResults>,
    StepState<null, ORCIDLinkResult>,
    StepState<{ narrativeTitle: string }, { title: string, author: Author }>,
    StepState<null, ContractNumbersResults>,
    StepState<null, GeolocationDataResults>,
    StepState<null, DescriptionResults>,
    StepState<ReviewAndSubmitParams, ReviewAndSubmitData>
]

export interface InitialDOIForm {
    steps: STEPS3
}

export interface DOIForm {
    form_id: string;
    owner: string;
    created_at: number;
    updated_at: number;
    steps: STEPS3
}

export interface DOIFormUpdate {
    form_id: string;
    steps: STEPS3
}

export interface CreateWorkResult {
    put_code: string;
}


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
        return await this.delete<LinkRecord | null>(`${REVOKE_PATH}`)
    }

    async createLinkingSession(): Promise<CreateLinkingSessionResult> {
        return await this.post<CreateLinkingSessionResult>(`${CREATE_LINKING_SESSION_PATH}`)
    }

    async getWork(putCode: string): Promise<Publication> {
        return await this.get<Publication>(`${GET_WORK_PATH}/${putCode}`)
    }

    async saveWork(work: WorkUpdate): Promise<Publication> {
        return await this.put<Publication>(`${SAVE_WORK_PATH}`, toJSON(work))
    }

    async createWork(work: Work): Promise<CreateWorkResult> {
        return await this.post<CreateWorkResult>(`${CREATE_WORK_PATH}`, toJSON(work))
    }

    async deleteWork(putCode: string): Promise<void> {
        await this.delete<void>(`${DELETE_WORK_PATH}/${putCode}`);
    }

    // async getName(): Promise<GetNameResult> {
    //     return await this.get<GetNameResult>(`${GET_NAME_PATH}`)
    // }

    async getDOIApplication(formId: string): Promise<DOIForm> {
        return await this.get<DOIForm>(`${GET_DOI_APPLICATION_PATH}/${formId}`)
    }

    async deleteDOIApplication(formId: string): Promise<void> {
        return await this.delete<void>(`${DELETE_DOI_APPLICATION_PATH}/${formId}`)
    }


    async getDOIApplications(): Promise<Array<DOIForm>> {
        return await this.get<Array<DOIForm>>(GET_DOI_APPLICATIONS_PATH)
    }


    async createDOIApplication(doiForm: InitialDOIForm): Promise<DOIForm> {
        return await this.post<DOIForm>(`${CREATE_DOI_APPLICATION_PATH}`, toJSON(doiForm))
    }

    async saveDOIApplication(doiForm: DOIFormUpdate): Promise<DOIForm> {
        return await this.put<DOIForm>(`${SAVE_DOI_APPLICATION_PATH}`, toJSON(doiForm))
    }

    async getLinkingSessionInfo(sessionId: string): Promise<LinkingSessionInfo> {
        return await this.get<LinkingSessionInfo>(`${GET_LINKING_SESSION_INFO_PATH}/${sessionId}`)
    }

    async finishLink(sessionId: string): Promise<void> {
        return await this.post<void>(FINISH_LINKING_SESSION_PATH, {
            session_id: sessionId
        });
    }

    async cancelLink(token: string): Promise<void> {
        return await this.delete<void>(`${CANCEL_LINKING_SESSION_PATH}/${token}`);
    }
}