import { Component } from 'react';

import contributorRoles from 'apps/ORCIDLink/data/contributorRoles.json';
import { SelfContributorGroup, SelfContributorGroupUtil } from '../workFields/SelfContributorGroup';

import FlexGrid, { FlexCol, FlexRow } from 'apps/NarrativePublishing/common/FlexGrid';
import { ValueStatus } from '../fields/Field';
import { StringArrayField } from '../fields/StringArrayField';
import { StringField } from '../fields/StringField';
import { renderFieldEditStatusClasses, renderFieldValidationIcon, renderFieldValidationMessage, renderHeaderValidationIcon } from "./common";
import MultiSelectEditor from './MultiSelectEditor';
import StringEditor from './StringEditor';


contributorRoles.sort(({ label: aValue }, { label: bValue }) => {
    return aValue.localeCompare(bValue);
});

// export interface SelfContributorGroupEditorProps {
//     contributor: EditableSelfContributor;
//     onChanged: (contributor: EditableSelfContributor) => void;
// }

export interface SelfContributorGroupEditorProps {
    debug?: boolean;
    field: SelfContributorGroup
    save: (field: SelfContributorGroup) => void;
}

export default class SelfContributorGroupEditor extends Component<
    SelfContributorGroupEditorProps
> {
    changed(changedGroup: SelfContributorGroup): void {
        this.props.save(new SelfContributorGroupUtil(changedGroup).evaluate());
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
            const newField: SelfContributorGroup = {
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
            placeholder='Please enter a name for the contributor'
            debug={this.props.debug}
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
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: SelfContributorGroup = {
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
            placeholder='Please enter the ORCID Id for the contributor'
            readonly
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
        const save = (roles: StringArrayField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: SelfContributorGroup = {
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

        return <MultiSelectEditor
            debug={this.props.debug}
            field={field.editValue.value.roles}
            noun="role"
            availableItems={contributorRoles}
            save={save}
            placeholder="No roles assigned"
        />
    }

    render() {
        const field = this.props.field;
        const { backgroundColorClasses, borderClasses } = renderFieldEditStatusClasses(field);
        const validationIcon = renderFieldValidationIcon(field);
        const headerValidationIcon = renderHeaderValidationIcon(field);
        const validationMessage = renderFieldValidationMessage(field);

        const validationRow = (() => {
            if (validationMessage) {
                return <FlexRow>{validationMessage}</FlexRow>
            }
        })();

        return <FlexGrid >
            <FlexRow header className={this.props.debug ? borderClasses : ''}>Your Contribution {' '} <span style={{ marginLeft: '1em' }}>{headerValidationIcon}</span></FlexRow>

            <FlexRow>
                <FlexCol width="6em" title>
                    Name
                </FlexCol>
                <FlexCol width="20em">
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
        </FlexGrid>
    }
}
