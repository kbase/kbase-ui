export interface Row<T> {
    index: number; // 0-based index
    value: T;
}

export enum DataProviderStatus {
    INITIAL = 'INITIAL',
    FETCHING = 'FETCHING',
    FETCHED = 'FETCHED',
    REFETCHING = 'REFETCHING',
    ERROR = 'ERROR',
}

export interface DataProviderStateBase {
    status: DataProviderStatus;
}

export interface DataProviderStateInitial extends DataProviderStateBase {
    status: DataProviderStatus.INITIAL;
    // value: {
    //     onRowRange: (from: number, to: number) => void
    // }
}

export interface DataProviderStateFetching extends DataProviderStateBase {
    status: DataProviderStatus.FETCHING;
}

export interface DataProviderStateFetched<T> extends DataProviderStateBase {
    status: DataProviderStatus.FETCHED;
    value: {
        from: number;
        to: number;
        rows: Array<Row<T>>;
        totalCount: number;
        filterCount: number;
        // onRowRange: (from: number, to: number) => void;
    };
}

export interface DataProviderStateRefetching<T> extends DataProviderStateBase {
    status: DataProviderStatus.REFETCHING;
    value: {
        from: number;
        to: number;
        rows: Array<Row<T>>;
        totalCount: number;
        filterCount: number;
    };
}

export interface DataProviderStateError extends DataProviderStateBase {
    status: DataProviderStatus.ERROR;
    message: string;
}

export type DataProviderState<T> =
    | DataProviderStateInitial
    | DataProviderStateFetching
    | DataProviderStateFetched<T>
    | DataProviderStateRefetching<T>
    | DataProviderStateError;
