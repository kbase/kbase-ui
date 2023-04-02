import { FlexCol, FlexRow } from 'apps/NarrativePublishing/common/FlexGrid';
import contributorRoles from 'apps/ORCIDLink/data/contributorRoles.json';
import { Component } from 'react';
import { Stack } from 'react-bootstrap';
import { ValueStatus } from '../fields/Field';
import { StringField } from '../fields/StringField';
import { ContributorGroup, ContributorGroupUtil } from '../workFields/ContributorGroup';
import { ContributorRoleArrayField } from '../workFields/ContributorRoleArrayField';

import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";
import MultiSelectEditor2 from './MultiSelectEditor2';
import StringEditor from './StringEditor';


contributorRoles.sort(({ label: aValue }, { label: bValue }) => {
    return aValue.localeCompare(bValue);
});

export interface ContributorGroupEditorProps {
    debug?: boolean;
    field: ContributorGroup
    save: (field: ContributorGroup) => void;
}

export default class ContributorGroupEditor extends Component<
    ContributorGroupEditorProps
> {
    changed(changedGroup: ContributorGroup): void {
        this.props.save(new ContributorGroupUtil(changedGroup).evaluate());
    }

    renderNameField() {
        const field = this.props.field;
        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }
        if (field.editValue.status !== ValueStatus.SOME) {
            return;
        }
        const save = (name: StringField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: ContributorGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: {
                        ...field.editValue.value,
                        name
                    }
                }
            }
            this.changed(newField);
        }
        return <StringEditor
            debug={this.props.debug}
            placeholder='Please enter a name for the contributor'
            save={save}
            field={field.editValue.value.name}
        />
    }


    renderORCIDIdField() {
        const field = this.props.field;
        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }
        if (field.editValue.status !== ValueStatus.SOME) {
            return;
        }
        const save = (orcidId: StringField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: ContributorGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: {
                        ...field.editValue.value,
                        orcidId
                    }
                }
            }
            this.changed(newField);
        }
        return <StringEditor
            debug={this.props.debug}
            placeholder='enter the ORCID Id (optional)'
            save={save}
            field={field.editValue.value.orcidId}
        />
    }

    renderRolesField() {
        const field = this.props.field;
        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }
        if (field.editValue.status !== ValueStatus.SOME) {
            return;
        }
        const save = (roles: ContributorRoleArrayField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: ContributorGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: {
                        ...field.editValue.value,
                        roles
                    }
                }
            }
            this.changed(newField);
        }

        return <MultiSelectEditor2
            debug={this.props.debug}
            field={field.editValue.value.roles}
            noun="Role"
            availableItems={contributorRoles}
            save={save}
            placeholder="No roles assigned"
        />
    }

    render() {
        const field = this.props.field;
        const editStatusBorder = this.props.debug ? renderFieldEditStatus(field) : '';
        const validationIcon = renderFieldValidationIcon(field);
        const validationMessage = renderFieldValidationMessage(field);

        const validationRow = (() => {
            if (validationMessage) {
                return <FlexRow>
                    <FlexCol>
                        {validationMessage}
                    </FlexCol>
                </FlexRow>
            }
        })();

        return (
            <Stack gap={2} className={editStatusBorder}>
                <FlexRow>
                    <FlexCol width="6em" title>
                        Name
                    </FlexCol>
                    <FlexCol>
                        {this.renderNameField()}
                    </FlexCol>
                    <FlexCol width="6em" title>
                        ORCID Id
                    </FlexCol>
                    <FlexCol width="16em">
                        {this.renderORCIDIdField()}
                    </FlexCol>
                </FlexRow>
                <FlexRow>
                    <FlexCol width="6em" title>
                        Roles
                    </FlexCol>
                    <FlexCol>
                        {this.renderRolesField()}
                    </FlexCol>
                </FlexRow>
                {validationRow}
            </Stack>
        );
    }
}
