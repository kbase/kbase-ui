import { FieldState } from "../../Field";


export enum FormStatus {
    INITIAL = 'INITIAL',
    VALIDATING = 'VALIDATING',
    SAVING = 'SAVING',
    EDITABLE = 'EDITABLE',
    MODIFIED = 'MODIFIED',
    ERROR = 'ERROR',
    IMPORTING = 'IMPORTING'
}

export interface EditableAuthor {
    firstName: FieldState<string, string>;
    middleName: FieldState<string, string>;
    lastName: FieldState<string, string>;
    emailAddress: FieldState<string, string>;
    orcidId: FieldState<string, string>;
    institution: FieldState<string, string>;
    contributorType: FieldState<string, string>;
}