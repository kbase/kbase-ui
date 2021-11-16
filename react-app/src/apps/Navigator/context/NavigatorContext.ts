import React from 'react';
import { AsyncProcess } from '../../../lib/AsyncProcess';
import { NarrativeSearchDoc } from '../utils/NarrativeModel';
import { SearchState } from './DataModel';

export interface NarrativeDetailState {
    narrativeDoc: NarrativeSearchDoc;
}

export enum NarrativeSelectedBy {
    NONE = 'NONE',
    ROUTE = 'ROUTE',
    USER = 'USER',
    SEARCH = 'SEARCH',
}

export interface UserInteractions {
    narrativeSelectedBy: NarrativeSelectedBy;
}

export interface NavigatorContextState {
    searchState: SearchState;
    userInteractions: UserInteractions;
    selectedNarrative: AsyncProcess<NarrativeDetailState, string>;
    // Actions

    selectNarrative: (narrativeId: number) => void;

    // fetchRows: (from: number, to: number) => void;
    setRange: (from: number, to: number) => void;
    setCategory: (category: string) => void;
    setQuery: (query: string) => void;
    setSort: (sort: string) => void;
    refresh: () => void;
}

export const NavigatorContext =
    React.createContext<NavigatorContextState | null>(null);
