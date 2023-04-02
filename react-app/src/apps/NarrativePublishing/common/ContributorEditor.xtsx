import { Component } from 'react';
import { Stack } from 'react-bootstrap';

import contributorRoles from 'apps/ORCIDLink/data/contributorRoles.json';
import { EditableContributor, EditState, EditStateBase, EditStatus, ValidationState, ValidationStatus } from '../Model';
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from './fields/common';
import MultiSelectField from './fields/MultiSelectField';
import StringField from './fields/StringField';
import { FlexCol, FlexRow } from './FlexGrid';

contributorRoles.sort(({ label: aValue }, { label: bValue }) => {
    return aValue.localeCompare(bValue);
});

export interface SelfContributorEditorProps {
    contributor: EditableContributor;
    onChanged: (contributor: EditableContributor) => void;
}

export default class SelfContributorEditor extends Component<
    SelfContributorEditorProps
> {
    onChanged(contributor: EditableContributor) {
        function isValid(v: EditStateBase): boolean {
            return v.validationState.status === ValidationStatus.VALID;
        }
        function isEdited(s: EditStateBase): boolean {
            return s.status === EditStatus.EDITED;
        }

        const allAreValid = (isValid(contributor.editValue.name) &&
            isValid(contributor.editValue.orcidId) &&
            isValid(contributor.editValue.roles));

        const validationState: ValidationState = (() => {
            if (allAreValid) {
                return {
                    status: ValidationStatus.VALID
                };
            }
            return {
                status: ValidationStatus.INVALID,
                message: 'One or more fields need to be corrected'
            }
        })();

        const anyAreChanged = isEdited(contributor.editValue.name) ||
            isEdited(contributor.editValue.orcidId) ||
            isEdited(contributor.editValue.roles);

        this.props.onChanged({
            ...contributor,
            validationState,
            status: anyAreChanged ? EditStatus.EDITED : EditStatus.INITIAL,
            editValue: contributor.editValue,
            value: {
                name: contributor.editValue.name.value,
                orcidId: contributor.editValue.orcidId.value,
                roles: contributor.editValue.roles.value
            }
        })

    }
    onRolesChanged(selectedRoles: EditState<Array<string>, Array<string>>) {
        const contributor = {
            ...this.props.contributor,
            editValue: {
                ...this.props.contributor.editValue,
                roles: selectedRoles
            }
        }
        this.onChanged(contributor);
    }
    onNameChanged(name: EditState<string, string>) {
        const contributor = {
            ...this.props.contributor,
            editValue: {
                ...this.props.contributor.editValue,
                name
            }
        }
        this.onChanged(contributor);
    }
    onORCIDIdChanged(orcidId: EditState<string, string>) {
        const contributor = {
            ...this.props.contributor,
            editValue: {
                ...this.props.contributor.editValue,
                orcidId
            }
        }
        this.onChanged(contributor);
    }

    render() {
        const field = this.props.contributor;
        const editStatusBorder = renderFieldEditStatus(field.status);
        const validationIcon = renderFieldValidationIcon(field.validationState.status);
        const validationMessage = renderFieldValidationMessage(field.validationState);

        console.log('contributor editor',)

        const validationMessageDisplay = (() => {
            if (validationMessage) {
                return <FlexRow>
                    <FlexCol>
                        {validationMessage}
                    </FlexCol>
                </FlexRow>
            }
        })()

        return (
            <Stack gap={2} className={editStatusBorder}>
                <FlexRow>
                    <FlexCol width="6em" title>
                        Name
                    </FlexCol>
                    <FlexCol width="20em">
                        <StringField editState={this.props.contributor.editValue.name}
                            placeholder="Please enter the contributor's name"
                            required={true}
                            save={(name: EditState<string, string>) => {
                                this.onNameChanged(name);
                            }} />
                    </FlexCol>
                    <FlexCol width="6em" title>
                        ORCID Id
                    </FlexCol>
                    <FlexCol width="14em">
                        <StringField editState={this.props.contributor.editValue.orcidId}
                            placeholder="Please enter the contributor's ORCID Id, if any"
                            required={false}
                            save={(type: EditState<string, string>) => {
                                this.onORCIDIdChanged(type);
                            }} />
                    </FlexCol>
                </FlexRow>
                <FlexRow>
                    <FlexCol width="6em" title>
                        Roles
                    </FlexCol>
                    <FlexCol>
                        <MultiSelectField
                            noun="Role"
                            availableItems={contributorRoles}
                            editState={this.props.contributor.editValue.roles}
                            save={this.onRolesChanged.bind(this)}
                            placeholder="No roles assigned"
                            required={true}
                        />
                    </FlexCol>
                </FlexRow>
                {validationMessageDisplay}
            </Stack>
        );
    }
}
