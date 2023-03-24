import { Field, NumberRangeLimit } from "./Field";


// Number

export interface NumberConstraint {
    min?: NumberRangeLimit
    max?: NumberRangeLimit
}

export type NumberField = Field<number, NumberConstraint, number>