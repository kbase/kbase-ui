import { Component } from 'react';
import { FormControl, Stack } from 'react-bootstrap';

import contributorRoles from 'apps/ORCIDLink/data/contributorRoles.json';
import { EditableSelfContributor, EditState, EditStateBase, EditStatus, ValidationState, ValidationStatus } from '../Model';
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from './fields/common';
import MultiSelectField from './fields/MultiSelectField';
import { FlexCol, FlexRow } from './FlexGrid';

contributorRoles.sort(({ label: aValue }, { label: bValue }) => {
    return aValue.localeCompare(bValue);
});

export interface SelfContributorEditorProps {
    contributor: EditableSelfContributor;
    onChanged: (contributor: EditableSelfContributor) => void;
}

interface SelfContributorEditorState {
    // just temporary.
    // selectedRoles: Array<string>;
    contributor: EditableSelfContributor;
}

export default class SelfContributorEditor extends Component<
    SelfContributorEditorProps,
    SelfContributorEditorState
> {
    constructor(props: SelfContributorEditorProps) {
        super(props);
        this.state = {
            // selectedRoles: props.contributor.editValue.roles.editValue,
            contributor: props.contributor,
        };
    }

    syncContainerState() {
        const { contributor } = this.state;

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

        if (contributor.validationState.status === ValidationStatus.VALID) {
            this.setState({
                contributor: {
                    ...contributor,
                    validationState,
                    status: anyAreChanged ? EditStatus.EDITED : EditStatus.INITIAL
                }
            }, () => {
                console.log('sending change...', this.state.contributor);
                this.props.onChanged(this.state.contributor);
            });
        }
    }

    onRolesChanged(selectedRoles: EditState<Array<string>, Array<string>>) {
        // Set state 
        this.setState({
            contributor: {
                ...this.state.contributor,
                editValue: {
                    ...this.state.contributor.editValue,
                    roles: selectedRoles
                },
                value: {
                    ...this.state.contributor.value,
                    roles: selectedRoles.value
                }
            },
        }, () => {
            this.syncContainerState();
        });
    }

    render() {
        const field = this.props.contributor;
        const editStatusBorder = renderFieldEditStatus(field.status);
        const validationIcon = renderFieldValidationIcon(field.validationState.status);
        const validationMessage = renderFieldValidationMessage(field.validationState);

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
                        <FormControl
                            value={this.props.contributor.editValue.name.editValue}
                            readOnly
                            disabled
                        />
                    </FlexCol>
                    <FlexCol width="6em" title>
                        ORCID Id
                    </FlexCol>
                    <FlexCol width="14em">
                        <FormControl
                            value={this.props.contributor.editValue.orcidId.editValue}
                            readOnly
                            disabled
                        />
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
                            editState={this.state.contributor.editValue.roles}
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
