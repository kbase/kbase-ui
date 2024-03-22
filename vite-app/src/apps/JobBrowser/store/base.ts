import { UIError } from '../types/error';

export enum ComponentLoadingState {
    NONE = 0,
    LOADING,
    SUCCESS,
    ERROR
}

export interface ViewBase {
    loadingState: ComponentLoadingState;
}

export interface ViewNone extends ViewBase {
    loadingState: ComponentLoadingState.NONE;
}

export interface ViewLoading extends ViewBase {
    loadingState: ComponentLoadingState.LOADING;
}

export interface ViewError extends ViewBase {
    loadingState: ComponentLoadingState.ERROR;
    error: UIError;
}

export interface ViewSuccess extends ViewBase {
    loadingState: ComponentLoadingState.SUCCESS;
}

export interface SimpleView { }

// Search

export enum SearchState {
    NONE = 0,
    INITIAL_SEARCHING,
    SEARCHING,
    SEARCHED,
    ERROR
}

// APp

export interface AppStat {
    appId: string;
    functionId: string;
    functionTitle: string;
    moduleId: string;
    moduleTitle: string;
    runCount: number;
    errorCount: number;
    successRate: number | null;
    averageRunTime: number | null;
    averageQueueTime: number | null;
    totalRunTime: number;
}