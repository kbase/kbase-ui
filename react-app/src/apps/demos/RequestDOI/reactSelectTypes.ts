
export interface Option<T> {
    value: T;
    label: string;
}

export type Options<T> = Array<Option<T>>;

export interface OptionsGroup<T> {
    label: string;
    options: Options<T>
}

export type OptionsGroups<T> = Array<OptionsGroup<T>>;