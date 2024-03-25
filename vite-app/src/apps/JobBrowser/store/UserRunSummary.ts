/**
 * User Run Summary types
 */
import {
    ViewNone, ViewLoading, ViewError, ViewSuccess, SearchState
} from './base';
import { UIError } from '../types/error';

// Data 

export interface UserRunSummaryViewDataBase {
    searchState: SearchState;
}

export interface UserRunSummaryViewDataNone extends UserRunSummaryViewDataBase {
    searchState: SearchState.NONE;
}

export interface UserRunSummaryViewDataInitialSearching extends UserRunSummaryViewDataBase {
    searchState: SearchState.INITIAL_SEARCHING;
    query: UserRunSummaryQuery;
}

export interface UserRunSummaryViewDataSearching extends UserRunSummaryViewDataBase {
    searchState: SearchState.SEARCHING;
    userRunSummary: Array<UserRunSummaryStat>;
    query: UserRunSummaryQuery;
}

export interface UserRunSummaryViewDataSearched extends UserRunSummaryViewDataBase {
    searchState: SearchState.SEARCHED;
    userRunSummary: Array<UserRunSummaryStat>;
    query: UserRunSummaryQuery;
}

export interface UserRunSummaryViewDataError extends UserRunSummaryViewDataBase {
    searchState: SearchState.ERROR;
    error: UIError;
}

export type UserRunSummaryViewData =
    UserRunSummaryViewDataNone |
    UserRunSummaryViewDataInitialSearching |
    UserRunSummaryViewDataSearching |
    UserRunSummaryViewDataSearched |
    UserRunSummaryViewDataError;

// View

export interface UserRunSummaryQuery {
    query: string;
}

export interface UserRunSummaryStat {
    username: string;
    isApp: boolean;
    appId: string | null;
    moduleName: string;
    functionName: string;
    runCount: number;
}

export type UserRunSummaryViewNone = ViewNone;
export type UserRunSummaryViewLoading = ViewLoading;
export type UserRunSummaryViewError = ViewError;
export interface UserRunSummaryViewSuccess extends ViewSuccess {
    view: UserRunSummaryViewData;
}
export type UserRunSummaryView =
    UserRunSummaryViewNone |
    UserRunSummaryViewLoading |
    UserRunSummaryViewError |
    UserRunSummaryViewSuccess;

