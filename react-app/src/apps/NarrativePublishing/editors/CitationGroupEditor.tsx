import FlexGrid, { FlexCol, FlexRow } from "apps/NarrativePublishing/common/FlexGrid";
import { citationTypes } from "apps/NarrativePublishing/common/lookups";
import { Component } from "react";
import { ValueStatus } from "../fields/Field";
import { StringField } from "../fields/StringField";
import { CitationGroup, CitationGroupUtil } from "../workFields/CitationGroup";
import { renderFieldEditStatusClasses, renderFieldValidationIcon, renderFieldValidationMessage, renderHeaderValidationIcon } from "./common";
import StringSelectEditor from "./StringSelectEditor";
import TextEditor from "./TextEditor";

export interface CitationFieldGroupEditorProps {
    debug?: boolean;
    field: CitationGroup
    save: (field: CitationGroup) => void;
}

export default class CitationFieldGroupEditor extends Component<CitationFieldGroupEditorProps> {
    changed(changedGroup: CitationGroup): void {
        this.props.save(new CitationGroupUtil(changedGroup).evaluate());
    }

    renderCitationTypeField() {
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
            const newField: CitationGroup = {
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
        return <StringSelectEditor
            debug={this.props.debug}
            placeholder='- select a citation format -'
            options={citationTypes}
            save={save}
            field={field.editValue.value.type}
        />
    }

    renderCitationValueField() {
        const field = this.props.field;
        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }
        if (field.editValue.status !== ValueStatus.SOME) {
            return;
        }
        const save = (citation: StringField) => {
            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            // TODO: something is not quite right about all this...
            const newField: CitationGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: {
                        ...field.editValue.value,
                        value: citation
                    }
                }
            }
            this.changed(newField);
        }
        return <TextEditor
            debug={this.props.debug}
            placeholder='enter a citation for this work'
            rows={3}
            save={save}
            field={field.editValue.value.value}
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

        return (
            <FlexGrid >
                <FlexRow header className={this.props.debug ? borderClasses : ''}>Citation {' '} <span style={{ marginLeft: '1em' }}>{headerValidationIcon}</span></FlexRow>
                <FlexRow>
                    <FlexCol width="6em" title>
                        Format
                    </FlexCol>
                    <FlexCol>{this.renderCitationTypeField()}</FlexCol>
                </FlexRow>
                <FlexRow>
                    <FlexCol width="6em" title>
                        Citation
                    </FlexCol>
                    <FlexCol>{this.renderCitationValueField()}</FlexCol>
                </FlexRow>
            </FlexGrid>
        );
    }
}
