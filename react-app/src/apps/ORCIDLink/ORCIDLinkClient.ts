import { toJSON } from "lib/kb_lib/jsonLike";
import { MultiServiceClient } from "./DynamicServiceClient";
import { ExternalId, LinkingSessionInfo, LinkRecord, ORCIDProfile, Publication } from "./Model";


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

export interface ReviewAndSubmitData {

}

// In the end, all we can use for citations are
// the DOI.
export interface CitationResults {
    citations: Array<string>
}


export interface NarrativeSelectionResult {
    narrativeInfo: MinimalNarrativeInfo
}

export interface MinimalNarrativeInfo {
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
    COMPLETE = 'COMPLETE'
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

export interface StepStateComplete<R> extends StepStateBase {
    status: StepStatus.COMPLETE;
    value: R;
}

export type StepState<P, R> =
    StepStateNone |
    StepStateIncomplete<P> |
    StepStateComplete<R>;


export type STEPS3 = [
    StepState<null, NarrativeSelectionResult>,
    StepState<null, ORCIDLinkResult>,
    StepState<{ narrativeTitle: string }, { title: string, author: Author }>,
    StepState<null, CitationResults>,
    StepState<null, ContractNumbersResults>,
    StepState<null, GeolocationDataResults>,
    StepState<null, DescriptionResults>,
    StepState<null, ReviewAndSubmitData>
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

    async createDOIApplication(doiForm: InitialDOIForm): Promise<DOIForm> {
        return await this.post<DOIForm>(`${CREATE_DOI_APPLICATION_PATH}`, toJSON(doiForm))
    }

    async saveDOIApplication(doiForm: DOIFormUpdate): Promise<DOIForm> {
        console.log('saving?', toJSON(doiForm))
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