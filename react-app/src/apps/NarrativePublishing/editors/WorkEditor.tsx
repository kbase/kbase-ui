import { Component } from 'react';
import { Form } from 'react-bootstrap';
import FlexGrid, { FlexCol, FlexRow } from '../common/FlexGrid';
import { Trinary, ValueStatus } from '../fields/Field';
import { StringField } from '../fields/StringField';
import { URLField } from '../fields/URLFIeld';
import { CitationGroup } from '../workFields/CitationGroup';
import { OtherContributorsGroup } from '../workFields/OtherContributorsGroup';
import { OtherExternalIdsGroup } from '../workFields/OtherExternalIdsGroup';
import { SelfContributorGroup } from '../workFields/SelfContributorGroup';
import { WorkGroup, WorkGroupUtil } from '../workFields/WorkGroup';
import CitationFieldGroupEditor from './CitationGroupEditor';
import { renderFieldEditStatus, renderFieldValidationIcon, renderFieldValidationMessage } from './common';
import OtherContributorsGroupEditor from './OtherContributorsGroupEditor';
import OtherExternalIdsGroupEditor from './OtherExternalIdsGroupEditor';
import SelfContributorGroupEditor from './SelfContributorGroupEditor';
import StringEditor from './StringEditor';
import TextEditor from './TextEditor';
import URLEditor from './URLEditor';
import styles from './WorkEditor.module.css';

export interface WorkEditorProps {
    debug?: boolean;
    field: WorkGroup;
    update: (workGroup: WorkGroup) => void;
}

export default class WorkEditor extends Component<WorkEditorProps> {
    changed(changedGroup: WorkGroup): void {
        this.props.update(new WorkGroupUtil(changedGroup).evaluate());
    }

    canSave(workGroup: WorkGroup) {
        return (
            workGroup.isRequiredMet === Trinary.TRUE &&
            workGroup.constraintState.isConstraintMet === Trinary.TRUE
        );
    }

    renderTitleField() {
        const save = (title: StringField) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        title
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <StringEditor placeholder='Please enter a title for this work'
                debug={this.props.debug}
                save={save}
                field={field.editValue.value.title}
            />
        }
    }

    renderJournalField() {
        const save = (journal: StringField) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        journal
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <StringEditor placeholder='Please enter a title for this work'
                debug={this.props.debug}
                save={save}
                readonly
                field={field.editValue.value.journal}
            />
        }
    }

    renderDateField() {
        const save = (date: StringField) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        date
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <StringEditor placeholder='Please enter a date for this work'
                save={save}
                readonly
                field={field.editValue.value.date}
            />
        }
    }

    renderURLField() {
        const save = (url: URLField) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        url
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <URLEditor
                placeholder='Please enter a URL for this work'
                save={save}
                readonly
                field={field.editValue.value.url}
            />
        }
    }



    renderDOIField() {
        const save = (doi: StringField) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        doi
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <StringEditor
                readonly
                save={save}
                field={field.editValue.value.doi}
            />
        }
    }

    renderShortDescriptionField() {
        const save = (shortDescription: StringField) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        shortDescription
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return "not ready";
            }
            return <TextEditor
                debug={this.props.debug}
                placeholder='enter a short description of this work'
                rows={3}
                save={save}
                field={field.editValue.value.shortDescription}
            />
        }
    }


    renderCitationFieldGroupEditor() {
        const save = (citation: CitationGroup) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        citation
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <CitationFieldGroupEditor
                debug={this.props.debug}
                field={field.editValue.value.citation}
                save={save}
            />
        }
    }

    renderSelfContributorGroupEditor() {
        const save = (selfContributor: SelfContributorGroup) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        selfContributor
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <SelfContributorGroupEditor
                debug={this.props.debug}
                field={field.editValue.value.selfContributor}
                save={save}
            />
        }
    }

    renderOtherContributorsGroupEditor() {
        const save = (otherContributors: OtherContributorsGroup) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        otherContributors
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <OtherContributorsGroupEditor
                debug={this.props.debug}
                field={field.editValue.value.otherContributors}
                save={save}
            />
        }
    }

    renderOtherExternalIdsGroupEditor() {
        const save = (otherExternalIds: OtherExternalIdsGroup) => {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }

            this.changed({
                ...field,
                editValue: {
                    status: ValueStatus.SOME,
                    value: {
                        ...field.editValue.value,
                        otherExternalIds
                    }
                }
            });
        }
        {
            const field = this.props.field;
            if (field.editValue.status !== ValueStatus.SOME) {
                return;
            }
            return <OtherExternalIdsGroupEditor
                debug={this.props.debug}
                field={field.editValue.value.otherExternalIds}
                save={save}
            />
        }
    }

    render() {
        const field = this.props.field;
        const editStatusBorder = this.props.debug ? renderFieldEditStatus(field) : '';
        const validationIcon = renderFieldValidationIcon(field);
        const validationMessage = renderFieldValidationMessage(field);

        return (
            <Form className={`${styles.main} ${editStatusBorder}`} style={{ padding: '1em' }}>
                <FlexGrid>
                    <FlexRow>
                        <FlexCol width="6em" title>
                            Publisher
                        </FlexCol>
                        <FlexCol width="10em">
                            {this.renderJournalField()}
                        </FlexCol>
                        <FlexCol width="auto" title>
                            Date
                        </FlexCol>
                        <FlexCol width="10em">
                            {this.renderDateField()}
                        </FlexCol>
                        <FlexCol width="auto" title>
                            URL
                        </FlexCol>
                        <FlexCol width="20em" >
                            {this.renderURLField()}
                        </FlexCol>
                        <FlexCol width="auto" title>
                            DOI
                        </FlexCol>
                        <FlexCol width="20em" >
                            {this.renderDOIField()}
                        </FlexCol>
                    </FlexRow>

                    {/* Description section */}

                    {/* <FlexRow header>Description</FlexRow> */}
                    <FlexRow>
                        <FlexCol width="6em" title>
                            Title
                        </FlexCol>
                        <FlexCol>{this.renderTitleField()}</FlexCol>
                    </FlexRow>
                    <FlexRow>
                        <FlexCol width="6em" title>
                            Description
                        </FlexCol>
                        <FlexCol>{this.renderShortDescriptionField()}</FlexCol>
                    </FlexRow>

                    {/* Citation Section */}

                    {this.renderCitationFieldGroupEditor()}

                    {/* Your Contribution Section  */}

                    {this.renderSelfContributorGroupEditor()}

                    {this.renderOtherContributorsGroupEditor()}

                    {/* <FlexRow header>DOI</FlexRow>
                    <FlexRow>
                        <FlexCol width="20em">
                            {this.renderDOIField()}
                        </FlexCol>
                    </FlexRow> */}
                    {this.renderOtherExternalIdsGroupEditor()}
                </FlexGrid>
            </Form>
        );
    }
}
