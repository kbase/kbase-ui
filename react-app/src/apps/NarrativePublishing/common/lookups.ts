import citationTypesRaw from './data/citationTypes.json';
import workTypesRaw from './data/workTypes2.json';

export interface OptionType {
    value: string;
    label: string;
}


export interface WorkType extends OptionType {
    category: string;
    description: string;
}
export interface WorkTypeCategory2 {
    category: string;
    label: string;
    values: Array<WorkType>
}

export type WorkTypes2 = Array<WorkTypeCategory2>

export const workTypes = workTypesRaw as unknown as WorkTypes2;
export const citationTypes = citationTypesRaw as unknown as Array<OptionType>;