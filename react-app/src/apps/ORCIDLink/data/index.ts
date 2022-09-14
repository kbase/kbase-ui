
import workIdentifiersRaw from './workIdentifiers.json';
import workRelationshipIdentfiersRaw from './workRelationships.json';

// Work External Idenfier Types
export interface WorkExternalIdentifierType {
    value: string;
    description: string;
    resolutionPrefix: string;
    caseSensitivity: string;
    primaryUse: string;
}

export type WorkExternalIdentifierTypes = Array<WorkExternalIdentifierType>;

export const workExternalIdentifierTypes = workIdentifiersRaw as WorkExternalIdentifierTypes;

// Work Relationships

export interface WorkRelationshipIdentifier {
    value: string;
    label: string;
    description: string;
}

export type WorkRelationshipIdentifiers = Array<WorkRelationshipIdentifier>;

export const workRelationshipIdentifiers = workRelationshipIdentfiersRaw as WorkRelationshipIdentifiers;