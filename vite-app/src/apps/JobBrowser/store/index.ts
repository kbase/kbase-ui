import { FilterSpec } from "../lib/JobBrowserBFFClient";
import { EpochTime } from "../types/base";
import { UIError } from "../types/error";
import { JobEventHistory } from "../types/jobState";
import { SimpleView, ViewError, ViewLoading, ViewNone, ViewSuccess } from "./base";

export type ClientGroup = string;
export type JobID = string;

export enum JobContextType {
    NARRATIVE,
    WORKSPACE,
    EXPORT,
    UNKNOWN
}

export interface JobContextBase {
    type: JobContextType;
}

// TODO: improve the typeng to AccessibleWorkspaceInfo, InaccessibleWorkspaceInfo
export interface WorkspaceInfo {
    id: number;
    isAccessible: boolean;
    name?: string;
    isDeleted?: boolean;
}

export interface JobContextNarrative extends JobContextBase {
    type: JobContextType.NARRATIVE;
    title: string | null;
    isTemporary: boolean;
    workspace: WorkspaceInfo;
}

export interface JobContextWorkspace extends JobContextBase {
    type: JobContextType.WORKSPACE;
    workspace: WorkspaceInfo;
}

export interface JobContextExport extends JobContextBase {
    type: JobContextType.EXPORT;
}

export interface JobContextUnknown extends JobContextBase {
    type: JobContextType.UNKNOWN;
}

export type JobContext =
    JobContextNarrative |
    JobContextWorkspace |
    JobContextExport |
    JobContextUnknown;

export type AppType = "narrative" | "unknown";

export interface App {
    id: string;
    moduleName: string;
    functionName: string;
    title: string;
    // clientGroups: Array<ClientGroup>;
    type: AppType;
    iconURL?: string;
}

// TODO: this needs to represent narrative / workspace / export job / unknown
export interface JobRequest {
    context: JobContext;
    app: App | null;
    clientGroup: ClientGroup;
    // TODO: should be User structure
    owner: {
        username: string;
        realname: string;
    };
}


// HMM trying this approach...

// Job Activity represents the active state of a job.
// It follows the progression of a job from creation, to 
// being queued, to running, and to being finished.

// Note that we distinguish between the final, resting state of 
// a job ("finished"), and the nature of the final state -
// complete, error, or terminate

export enum JobActivity {
    CREATE,
    QUEUE,
    RUN,
    FINISH
}

export enum JobFate {
    COMPLETE,
    ERROR,
    TERMINATE
}

// Job Activity

export interface JobActivityBase {
    activity: JobActivity;
    timeline: {};
}

export interface JobActivityCreate {
    activity: JobActivity.CREATE;
    timeline: {
        createAt: EpochTime;
    };
}

export interface JobActivityQueue {
    activity: JobActivity.QUEUE;
    timeline: {
        createAt: EpochTime;
        queueAt: EpochTime;
    };
}

export interface JobActivityRun {
    activity: JobActivity.RUN;
    timeline: {
        createAt: EpochTime;
        queueAt: EpochTime;
        runAt: EpochTime;
    };
}

export interface JobActivityFinishBase {
    activity: JobActivity.FINISH;
    fate: JobFate;
    timeline: {
        createAt: EpochTime;
        queueAt: EpochTime;
        runAt: EpochTime;
        finishAt: EpochTime;
    };
}

export interface JobActivityFinishComplete extends JobActivityFinishBase {
    fate: JobFate.COMPLETE;
}

export interface JobActivityFinishError extends JobActivityFinishBase {
    fate: JobFate.ERROR,
    error: {
        code: number;
        message: string;
    };
}

export interface JobActivityFinishTerminate extends JobActivityFinishBase {
    fate: JobFate.TERMINATE,
    terminate: {
        code: number;
    };
}

export type JobActivityState =
    JobActivityCreate |
    JobActivityQueue |
    JobActivityRun |
    JobActivityFinishComplete |
    JobActivityFinishError |
    JobActivityFinishTerminate;

// The second aspect of the job state is the finish state.
// This represents the conditions under which the job reached its 
// ultimate state. 
// Note that the finish states do not have a timestamp, since there 
// is no further change over time.



// Now put it all together!

export interface JobStateBase {
    id: JobID;
    request: JobRequest;
    activity: JobActivityState;
}

export interface JobStateCreate extends JobStateBase {
    activity: JobActivityCreate;
}

export interface JobStateQueue extends JobStateBase {
    activity: JobActivityQueue;
}

export interface JobStateRun extends JobStateBase {
    activity: JobActivityRun;
}

// NB this covers 
export interface JobStateComplete extends JobStateBase {
    activity: JobActivityFinishComplete;
}

export interface JobStateError extends JobStateBase {
    activity: JobActivityFinishError;
}

export interface JobStateTerminate extends JobStateBase {
    activity: JobActivityFinishTerminate;
}

// export interface JobStateComplete extends JobStateBase {
//     // State
//     fate: JobFate.COMPLETE;
//     completeAt: EpochTime;
// }

// export interface JobStateError extends JobStateBase {
//     // State
//     fate: JobFate.ERROR;
//     errorAt: EpochTime;
//     errorReason: {
//         code: number;
//         message: string;
//         data: object;
//     }
// }

// export interface JobStateTerminate extends JobStateBase {
//     // State
//     fate: JobFate.TERMINATE;
//     terminateAt: EpochTime;
//     terminateReason: {
//         code: number;
//         message: string
//     }
// }

export type JobState =
    JobStateCreate |
    JobStateQueue |
    JobStateRun |
    JobStateComplete |
    JobStateError |
    JobStateTerminate;

// export type Job = JobState;
export interface Job {
    id: JobID;
    request: JobRequest;
    eventHistory: JobEventHistory;
}

// interface JobsState {
//     jobs: Array<Job>;
// }

export type TimeRangePresets = 'lastHour' | 'last48Hours' | 'lastWeek' | 'lastMonth' | 'lastYear' | 'allTime';

export interface TimeRangePreset {
    kind: 'preset';
    preset: TimeRangePresets;
}

export interface TimeRangeLiteral {
    kind: 'literal';
    start: EpochTime;
    end: EpochTime;
}

export type TimeRange = TimeRangePreset | TimeRangeLiteral;

export interface TimeRange2 {
    preset: TimeRangePresets;
    start: EpochTime | null;
    end: EpochTime | null;
}

export interface SortSpec {
    field: string;
    direction: 'ascending' | 'descending';
}

// TODO: unify with the same definition in JobBrowserBFFClient.ts
export type JobSearchStatus = 'create' | 'queue' | 'run' | 'complete' | 'error' | 'terminate';


export interface JobsSearchExpression {
    query?: string;
    filter?: FilterSpec;
    timeRange: TimeRange;
    sort: SortSpec | null;
    jobStatus?: Array<JobSearchStatus>;
    forceSearch: boolean;
    offset: number;
    limit: number;
}

// The Store!

// export interface MainView {
//     loadingState: ComponentLoadingState;
//     error: SimpleError | null;
//     isAdmin: boolean;
//     // tabView: TabView
// }

export enum ViewType {
    NONE,
    MY_JOBS,
    USER_JOBS,
    PUBLIC_APP_STATS,
    USER_SUMMARY
}

// Jobs

export interface JobSearchResult {
    jobs: Array<Job>;
    jobsFetchedAt: EpochTime;
    foundCount: number;
    totalCount: number;
}

export enum JobSearchState {
    NONE,
    INITIAL_SEARCHING,
    SEARCHING,
    READY,
    ERROR
}

// MyJobs view

export type MyJobsViewNone = ViewNone;
export type MyJobsViewLoading = ViewLoading;
export type MyJobsViewError = ViewError;

// View Data

export interface MyJobsViewDataBase {
    searchState: JobSearchState;
}

export interface MyJobsViewDataNone extends MyJobsViewDataBase {
    searchState: JobSearchState.NONE;
}

// When the "my jobs" viewer has been loaded, the first thing to
// do is to build up a view of the initial jobs. This is done by applying
// some default search params to a search. These params are used to BOTH
// populate the search controls which ar not empty, and also to 
// conduct an initial search.
export interface MyJobsViewDataInitialSearching extends MyJobsViewDataBase {
    searchState: JobSearchState.INITIAL_SEARCHING;
    searchExpression: JobsSearchExpression;
}

export interface MyJobsViewDataSearching extends MyJobsViewDataBase {
    searchState: JobSearchState.SEARCHING;
    searchExpression: JobsSearchExpression;
    searchResult: JobSearchResult;
}

export interface MyJobsViewDataReady extends MyJobsViewDataBase {
    searchState: JobSearchState.READY;
    searchExpression: JobsSearchExpression;
    searchResult: JobSearchResult;
}

export interface MyJobsViewDataError extends MyJobsViewDataBase {
    searchState: JobSearchState.ERROR;
    error: UIError;
}

export type MyJobsViewData =
    MyJobsViewDataNone |
    MyJobsViewDataInitialSearching |
    MyJobsViewDataSearching |
    MyJobsViewDataReady |
    MyJobsViewDataError;

// Top level view

// export interface MyJobsViewData {
//     searchState: SearchState;
//     jobs: Array<Job>;
//     searchExpression: JobsSearchExpression;
//     jobsFetchedAt: EpochTime;
//     foundCount: number;
//     totalCount: number;
// }

export interface MyJobsViewSuccess extends ViewSuccess {
    data: MyJobsViewData;
}

// export type MyJobsView =
//     MyJobsViewNone |
//     MyJobsViewLoading |
//     MyJobsViewError |
//     MyJobsViewSuccess;

export type MyJobsView = SimpleView;

// export interface MyJobsView extends TabViewBase {
//     type: ViewType.MY_JOBS;
//     searchState: SearchState;
//     searchExpression: JobsSearchExpression;
//     jobsFetchedAt: EpochTime;
//     rawJobs: Array<Job>;
//     jobs: Array<Job>;
//     foundCount: number;
//     totalCount: number;
// }

// User Jobs View

export type UserJobsViewNone = ViewNone;
export type UserJobsViewLoading = ViewLoading;
export type UserJobsViewError = ViewError;

// View Data

export interface UserJobsViewDataBase {
    searchState: JobSearchState;
}

export interface UserJobsViewDataInitialSearching extends UserJobsViewDataBase {
    searchState: JobSearchState.INITIAL_SEARCHING;
    searchExpression: JobsSearchExpression;
}

export interface UserJobsViewDataSearching extends UserJobsViewDataBase {
    searchState: JobSearchState.SEARCHING;
    searchExpression: JobsSearchExpression;
    searchResult: JobSearchResult;
}

export interface UserJobsViewDataReady extends UserJobsViewDataBase {
    searchState: JobSearchState.READY;
    searchExpression: JobsSearchExpression;
    searchResult: JobSearchResult;
}

export interface UserJobsViewDataError extends UserJobsViewDataBase {
    searchState: JobSearchState.ERROR;
    error: UIError;
}

export type UserJobsViewData =
    UserJobsViewDataInitialSearching |
    UserJobsViewDataSearching |
    UserJobsViewDataReady |
    UserJobsViewDataError;

// Top Level View

export interface UserJobsViewSuccess extends ViewSuccess {
    data: UserJobsViewData;
}
export type UserJobsView =
    UserJobsViewNone |
    UserJobsViewLoading |
    UserJobsViewError |
    UserJobsViewSuccess;


// export interface UserJobsView extends TabViewBase {
//     searchState: SearchState;
//     type: ViewType.USER_JOBS;
//     searchExpression: JobsSearchExpression;
//     jobsFetchedAt: EpochTime;
//     rawJobs: Array<Job>;
//     jobs: Array<Job>;
// }

// export type TabView =
//     NoneView |
//     MyJobsView |
//     UserJobsView |
//     PublicAppStatsView |
//     UserRunSummaryView

// export interface DynamicServiceConfig {
//     version: string;
// }

// export interface MyStoreState {
//     views: {
//         mainView: MainView;
//         myJobsView: MyJobsView;
//         userJobsView: UserJobsView;
//         publicAppStatsView: PublicAppStatsView;
//         userRunSummaryView: UserRunSummaryView;
//     };
// }

// export interface StoreState extends StoreState, MyStoreState {
// }





// export interface UserRunSummaryView extends TabViewBase {
//     type: ViewType.USER_SUMMARY;
//     searchState: SearchState;
//     userRunSummary: Array<UserRunSummaryStat>;
//     query: UserRunSummaryQuery;
// }

// export function makeInitialStoreState(): StoreState {
//     const baseState = makeBaseStoreState();
//     return {
//         ...baseState,
//         views: {
//             mainView: {
//                 loadingState: ComponentLoadingState.NONE,
//                 error: null,
//                 isAdmin: false,
//                 // tabView: {
//                 //     type: ViewType.NONE
//                 // }
//                 // tabView: {
//                 //     type: ViewType.MY_JOBS,
//                 //     searchState: SearchState.NONE,
//                 //     searchExpression: null,
//                 //     jobsFetchedAt: null,
//                 //     rawJobs: jobs,
//                 //     foundCount: 0,
//                 //     totalCount: 0,
//                 //     jobs
//                 // }
//             },
//             myJobsView: {
//                 loadingState: ComponentLoadingState.NONE
//                 // searchState: SearchState.NONE,
//                 // searchExpression: null,
//                 // jobsFetchedAt: null,
//                 // rawJobs: jobs,
//                 // foundCount: 0,
//                 // totalCount: 0,
//                 // jobs
//             },
//             userJobsView: {
//                 loadingState: ComponentLoadingState.NONE
//                 // searchState: SearchState.NONE,
//                 // searchExpression: null,
//                 // jobsFetchedAt: null,
//                 // rawJobs: jobs,
//                 // jobs
//             },
//             publicAppStatsView: {
//                 loadingState: ComponentLoadingState.NONE
//                 // searchState: SearchState.NONE,
//                 // rawAppStats: [],
//                 // appStats: [],
//                 // query: {
//                 //     query: ''
//                 // }
//             },
//             userRunSummaryView: {
//                 loadingState: ComponentLoadingState.NONE
//                 // searchState: SearchState.NONE,
//                 // userRunSummary: [],
//                 // query: {
//                 //     query: ''
//                 // }
//             }
//         }
//     };
// }

// export function createReduxStore() {
//     return createStore(reducer, makeInitialStoreState(), compose(applyMiddleware(thunk)));
// }
