import {
    ViewNone, ViewLoading, ViewError, SearchState, ViewSuccess, AppStat
} from "./base";
import { UIError } from "../types/error";

// App Stats

export interface PublicAppStatsQuery {
    query: string;
}

export type PublicAppStatsViewNone = ViewNone;
export type PublicAppStatsViewLoading = ViewLoading;
export type PublicAppStatsViewError = ViewError;

// Data

export interface PublicAppStatsViewDataBase {
    searchState: SearchState;
}

export interface PublicAppStatsViewDataNone extends PublicAppStatsViewDataBase {
    searchState: SearchState.NONE;
}

export interface PublicAppStatsViewDataInitialSearching extends PublicAppStatsViewDataBase {
    searchState: SearchState.INITIAL_SEARCHING;
    query: PublicAppStatsQuery;
}

export interface PublicAppStatsViewDataSearching extends PublicAppStatsViewDataBase {
    searchState: SearchState.SEARCHING;
    query: PublicAppStatsQuery;
    rawAppStats: Array<AppStat>;
    appStats: Array<AppStat>;
}

export interface PublicAppStatsViewDataSearched extends PublicAppStatsViewDataBase {
    searchState: SearchState.SEARCHED;
    query: PublicAppStatsQuery;
    rawAppStats: Array<AppStat>;
    appStats: Array<AppStat>;
}

export interface PublicAppStatsViewDataError extends PublicAppStatsViewDataBase {
    searchState: SearchState.ERROR;
    error: UIError;
}

export type PublicAppStatsViewData =
    PublicAppStatsViewDataNone |
    PublicAppStatsViewDataInitialSearching |
    PublicAppStatsViewDataSearching |
    PublicAppStatsViewDataSearched |
    PublicAppStatsViewDataError;

// View

export interface PublicAppStatsViewSuccess extends ViewSuccess {
    view: PublicAppStatsViewData;
}

export type PublicAppStatsView =
    PublicAppStatsViewNone |
    PublicAppStatsViewLoading |
    PublicAppStatsViewError |
    PublicAppStatsViewSuccess;

// export interface PublicAppStatsView extends TabViewBase {
//     type: ViewType.PUBLIC_APP_STATS;
//     searchState: SearchState;
//     rawAppStats: Array<AppStat>;
//     appStats: Array<AppStat>;
//     query: PublicAppStatsQuery;
// }

