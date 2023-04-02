import { Component } from "react";
import { Value, ValueStatus } from "../fields/Field";

import MultiSelect from "apps/NarrativePublishing/common/MultiSelect";
import { ContributorRole } from "apps/ORCIDLink/lib/ORCIDLinkClient";
import { ContributorRoleArrayField, ContributorRoleArrayFieldUtil } from "../workFields/ContributorRoleArrayField";
import { OptionType, renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from "./common";

export interface MultiSelectEditor2Props {
    debug?: boolean;
    field: ContributorRoleArrayField
    placeholder: string;
    noun: string;
    availableItems: Array<OptionType>;
    save: (d: ContributorRoleArrayField) => void;
}

export default class MultiSelectEditor2 extends Component<MultiSelectEditor2Props> {
    validate(editedValue: Array<ContributorRole>): ContributorRoleArrayField {
        const editValue: Value<Array<ContributorRole>> = (() => {
            if (editedValue.length === 0) {
                return {
                    status: ValueStatus.EMPTY
                }
            }
            return {
                status: ValueStatus.SOME,
                value: editedValue
            }
        })();

        return new ContributorRoleArrayFieldUtil({
            ...this.props.field,
            editValue,
        }).evaluate();
    }

    changed(editedValue: Array<string>): void {
        const editedValue2 = editedValue.map((role) => { return { role } });
        this.props.save(this.validate(editedValue2));
    }

    render() {
        const field = this.props.field;
        const options = this.props.availableItems.map(({ value, label }) => {
            return (
                <option value={value} key={value}>
                    {label}
                </option>
            );
        });
        options.unshift(
            <option value="" key="noop">
                {this.props.placeholder}
            </option>
        );
        const editValue: Array<ContributorRole> = (() => {
            switch (field.editValue.status) {
                case ValueStatus.NONE:
                    return [];
                case ValueStatus.EMPTY:
                    return [];
                case ValueStatus.SOME:
                    return field.editValue.value;
            }
        })();

        const editValue2: Array<string> = (() => {
            switch (field.editValue.status) {
                case ValueStatus.NONE:
                    return [];
                case ValueStatus.EMPTY:
                    return [];
                case ValueStatus.SOME:
                    return field.editValue.value.map(({ role }) => role);
            }
        })();

        const editStatusBorder = this.props.debug ? renderFieldEditStatus(field) : '';
        const validationIcon = renderFieldValidationIcon(field);
        const validationMessage = renderFieldValidationMessage(field);

        return (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
                    className={editStatusBorder}>
                    {validationIcon}
                    <MultiSelect
                        noun={this.props.noun}
                        availableItems={this.props.availableItems}
                        onChange={this.changed.bind(this)}
                        selectedValues={editValue2}
                    />
                </div>
                {validationMessage}
            </div>
        );
    }
}
