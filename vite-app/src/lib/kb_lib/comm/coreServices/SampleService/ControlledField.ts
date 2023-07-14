// Sample Controlled Field Typing, based on JSONSchema type.
// TODO: perhaps a widely used TS jsoncschema already has a type definition
// we can piggyback on??

import { JSONValue } from '@kbase/ui-lib/lib/json';
import { JSONLikeObjectOf, JSONLikeValue } from '../../../jsonLike';

export type JSONSchemaFieldType =
    | 'string'
    | 'number'
    | 'boolean'
    | 'object'
    | 'array';

export interface JSONSchema extends JSONLikeObjectOf<JSONLikeValue> {
    $schema: string;
    $id?: string;
    type: JSONSchemaFieldType;
    format?: string;
    title: string;
    description?: string;
    examples: Array<JSONValue>;
}

export type ControlledFieldType = 'string' | 'number' | 'boolean';

export interface ControlledFieldBase extends JSONSchema {
    type: ControlledFieldType;
    kbase: {
        format: {};
        unit: string;
        sample: {
            key: string;
        };
    };
}

export interface ControlledFieldString extends ControlledFieldBase {
    type: 'string';
    minLength?: number;
    maxLength?: number;
    enum?: Array<string>;
    pattern?: string;
}

export interface ControlledFieldOntologyTerm extends ControlledFieldBase {
    type: 'string';
    format: 'ontologyTerm';
    ancestorTerm: string;
    namespace: string;
}

export interface ControlledFieldNumber extends ControlledFieldBase {
    type: 'number';
    minimum?: number;
    minimumInclusive?: number;
    maximum?: number;
    maximumInclusive?: number;
    kbase: ControlledFieldBase['kbase'] & {
        format: {
            useGrouping?: boolean;
            minimumFractionDigits?: number;
            maximumFractionDigits?: number;
            minimumSignificantDigits?: number;
            maximumSignificantDigits?: number;
            style?: 'decimal' | 'currency' | 'percent' | 'unit';
            notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
        };
    };
}

export type ControlledField =
    | ControlledFieldString
    | ControlledFieldOntologyTerm
    | ControlledFieldNumber;
