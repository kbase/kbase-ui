import { FlexCol, FlexRow } from 'apps/NarrativePublishing/common/FlexGrid';
import contributorRoles from 'apps/ORCIDLink/data/contributorRoles.json';
import { Component } from 'react';
import { Stack } from 'react-bootstrap';
import { workExternalIdentifierTypes, workRelationshipIdentifiers } from "../common/data";
import { ValueStatus } from '../fields/Field';
import { StringField } from '../fields/StringField';
import { URLField } from '../fields/URLFIeld';
import { ExternalIdGroup, ExternalIdGroupUtil } from '../workFields/ExternalIdGroup';
import { OptionType, renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";
import StringEditor from './StringEditor';
import StringSelectEditor from './StringSelectEditor';
import URLEditor from './URLEditor';


contributorRoles.sort(({ label: aValue }, { label: bValue }) => {
    return aValue.localeCompare(bValue);
});
export interface ExternalIdGroupEditorProps {
    debug?: boolean;
    field: ExternalIdGroup
    save: (field: ExternalIdGroup) => void;
}

export default class ExternalIdGroupEditor extends Component<
    ExternalIdGroupEditorProps
> {
    changed(changedGroup: ExternalIdGroup): void {
        this.props.save(new ExternalIdGroupUtil(changedGroup).evaluate());
    }
    getExternalIdentifierTypes(): Array<OptionType> {
        return workExternalIdentifierTypes.map(({ value, description }) => {
            return {
                value,
                label: description,
            };
        });
    }

    getExternalRelationshipIdentifiers(): Array<OptionType> {
        return workRelationshipIdentifiers
            .map(({ value, label }) => {
                return {
                    value,
                    label,
                };
            })
            .sort(({ label: labelA }, { label: labelB }) => {
                return labelA.localeCompare(labelB);
            });
    }
    renderTypeField() {
        const field = this.props.field;
        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }
        if (field.editValue.status !== ValueStatus.SOME) {
            return;
        }
        const save = (type: StringField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: ExternalIdGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: {
                        ...field.editValue.value,
                        type
                    }
                }
            }
            this.changed(newField);
        }
        const options = this.getExternalIdentifierTypes();

        return <StringSelectEditor
            placeholder=''
            options={options}
            save={save}
            field={field.editValue.value.type}
        />
    }

    renderValueField() {
        const field = this.props.field;
        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }
        if (field.editValue.status !== ValueStatus.SOME) {
            return;
        }
        const save = (value: StringField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: ExternalIdGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: {
                        ...field.editValue.value,
                        value
                    }
                }
            }
            this.changed(newField);
        }
        return <StringEditor placeholder='Please enter the ORCID Id for the contributor'
            save={save}
            field={field.editValue.value.value}
        />
    }

    renderURLField() {
        const field = this.props.field;
        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }
        if (field.editValue.status !== ValueStatus.SOME) {
            return;
        }
        const save = (url: URLField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: ExternalIdGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: {
                        ...field.editValue.value,
                        url
                    }
                }
            }
            this.changed(newField);
        }
        return <URLEditor placeholder='Please enter the ORCID Id for the contributor'
            save={save}
            field={field.editValue.value.url}
        />
    }
    renderRelationshipField() {
        const field = this.props.field;
        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }
        if (field.editValue.status !== ValueStatus.SOME) {
            return;
        }
        const save = (relationship: StringField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: ExternalIdGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: {
                        ...field.editValue.value,
                        relationship
                    }
                }
            }
            this.changed(newField);
        }
        // return <StringEditor placeholder='Please enter the ORCID Id for the contributor'
        //     save={save}
        //     field={field.editValue.value.relationship}
        // />
        const options = this.getExternalRelationshipIdentifiers();

        return <StringSelectEditor
            placeholder=''
            options={options}
            save={save}
            field={field.editValue.value.relationship}
        />
    }


    render() {
        const field = this.props.field;
        const editStatusBorder = this.props.debug ? renderFieldEditStatus(field) : '';
        const validationIcon = renderFieldValidationIcon(field);
        const validationMessage = renderFieldValidationMessage(field);

        const validationRow = (() => {
            if (validationMessage) {
                return <FlexRow>{validationMessage}</FlexRow>
            }
        })();

        return (
            <Stack gap={2} className={editStatusBorder}>
                <FlexRow>
                    <FlexCol width="4em" title>
                        Type
                    </FlexCol>
                    <FlexCol width="20em">
                        {this.renderTypeField()}
                    </FlexCol>

                    <FlexCol width="6em" title>
                        Relationship
                    </FlexCol>
                    <FlexCol width="20em">
                        {this.renderRelationshipField()}
                    </FlexCol>
                </FlexRow>
                <FlexRow>
                    <FlexCol width="4em" title>
                        Value
                    </FlexCol>
                    <FlexCol >
                        {this.renderValueField()}
                    </FlexCol>
                    <FlexCol width="4em" title>
                        URL
                    </FlexCol>
                    <FlexCol >
                        {this.renderURLField()}
                    </FlexCol>
                </FlexRow>
                {validationRow}
            </Stack>
        );
    }
}
