import React from 'react';
import { AsyncProcess2 } from '../../../lib/AsyncProcess2';
import { NarrativeSearchDoc } from '../utils/NarrativeModel';
import { DetailOptions, SearchState } from './DataModel';

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
    selectedNarrative: AsyncProcess2<
        DetailOptions,
        NarrativeDetailState,
        string
    >;
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
