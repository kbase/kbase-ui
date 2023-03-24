
export enum ValueStatus {
    NONE = 'NONE',
    EMPTY = 'EMPTY',
    SOME = 'SOME'
}

export interface ValueBase {
    status: ValueStatus
}

export interface ValueNone extends ValueBase {
    status: ValueStatus.NONE
}

export interface ValueEmpty extends ValueBase {
    status: ValueStatus.EMPTY
}

export interface ValueSome<T> extends ValueBase {
    status: ValueStatus.SOME
    value: T
}

export type Value<T> =
    ValueNone | ValueEmpty | ValueSome<T>;

export enum Trinary {
    NONE = "NONE",
    TRUE = "TRUE",
    FALSE = "FALSE"
}

// export interface FieldRules<TConstraint> {
//     //rules
//     isRequired: boolean;
//     constraint: TConstraint;
//     //state
//     isRequiredMet: Trinary,
//     isContraintMet: Trinary
// }

export enum StorageStatus {
    NONE = "NONE",
    CONSISTENT = "CONSISTENT",
    INCONSISTENT = "INCONSISTENT"
}

export interface ConstraintStateBase {
    isConstraintMet: Trinary
}

export interface ConstraintStateNone extends ConstraintStateBase {
    isConstraintMet: Trinary.NONE
}

export interface ConstraintStateTrue extends ConstraintStateBase {
    isConstraintMet: Trinary.TRUE
}

export interface ConstraintStateFalse extends ConstraintStateBase {
    isConstraintMet: Trinary.FALSE
    message: string
}

export type ConstraintState =
    ConstraintStateNone | ConstraintStateTrue | ConstraintStateFalse

export interface FieldBase {
    // facts
    isRequired: boolean;
    //state
    isTouched: boolean;
    storageStatus: StorageStatus;
    isRequiredMet: Trinary,
    constraintState: ConstraintState
}


export interface Field<TEditValue, TConstraint, TStorageValue> extends FieldBase {
    // facts
    constraint?: TConstraint
    // state
    editValue: Value<TEditValue>
    pendingValue: Value<TStorageValue>
    storageValue: Value<TStorageValue>
}

export enum NumberRangeType {
    INCLUSIVE = "INCLUSIVE",
    EXCLUSIVE = "EXCLISIVE"
}

export interface NumberRangeLimit {
    value: number;
    rangeType: NumberRangeType
}



// export abstract class FieldUtil<TField extends Field, TStorage> {
//     field: TField;
//     constructor(field: TField) {
//         this.field = field;
//     }

//     abstract evaluate(): TField

//     getPendingValue(): TStorage {
//         const field = this.field;
//         switch (field.pendingValue.status) {
//             case ValueStatus.NONE:
//                 throw new Error('impossible');
//             case ValueStatus.EMPTY:
//                 return ''
//             case ValueStatus.SOME:
//                 return field.pendingValue.value;
//         }
//     }
// }
