import Well from 'components/Well';
import { StringEditor } from 'formSupport/editors/StringEditor';

import { changeHash2 } from 'lib/navigation';
import { Component } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import FlexGrid, { FlexCol, FlexRow } from '../common/FlexGrid';
import ScrollingArea from '../common/ScrollingArea';

// import {
//     EditableContributor,
//     EditableExternalId,
//     editableExternalIdsToExternalIds,
//     EditableWork,
//     EditStateBase,
//     EditStatus,
//     initialEditableExternalId, ValidationState, ValidationStatus
// } from '../../Model';

// import EditExternalIdentifiers from '../common/EditExternalIdentifiers';
// import { EditState } from '../Model';
// import { workExternalIdentifierTypes, workRelationshipIdentifiers } from './data';
// import SelectField from './fields/SelectField';
// import TextField from './fields/TextField';
// import FlexGrid, { FlexCol, FlexRow } from './FlexGrid';
// import { citationTypes } from './lookups';
// import ScrollingArea from './ScrollingArea';
import styles from './WorkEditor.module.css';
import { ShortDescriptionField } from './WorkFields';

// export interface EditableCitation {
//     type: StringArrayField
//     value: StringField
// }

// export interface EditableWork {
//     // putCode: EditState<string, string>
//     // workType: EditState<string, string>
//     // title: EditState<string, string>
//     // date: EditState<string, string>
//     // journal: EditState<string, string>
//     // url: EditState<string, string>
//     // doi: EditState<string, string>
//     // externalIds: EditState<Array<EditableExternalId>, Array<ExternalId>>
//     citation: CitationFieldGroup
//     // shortDescription: EditState<string, string>
//     // selfContributor: EditableContributor
//     // // TODO: Implement
//     // otherContributors: EditableContributors
// }



export interface EditableWork {
    shortDescription: ShortDescriptionField
}

export interface WorkEditorProps {
    work: EditableWork;
    // workTypes: WorkTypes2;
    // citationTypes: Array<OptionType>;
    // workExternalIdentifierTypes: WorkExternalIdentifierTypes;
    // workRelationshipIdentifiers: WorkRelationshipIdentifiers;

    // orcidLink: LinkRecord;
    // onClose: () => void;
    onSave: (editableWork: EditableWork) => Promise<void>;
}

interface WorkEditorState {
    editableWork: EditableWork;
    canSave: boolean;
}

export default class WorkEditor extends Component<WorkEditorProps, WorkEditorState> {
    constructor(props: WorkEditorProps) {
        super(props);
        this.state = {
            editableWork: props.work,
            canSave: this.canSave(props.work)
        };
    }

    canSave(editableWork: EditableWork) {
        return false;
    }

    doSave() {

    }

    onShortDescriptionEdit(shortDescription: string) {

    }

    renderForm() {
        return (
            <Form className={`${styles.main}`} style={{ padding: '1em' }}>
                <FlexGrid>
                    <FlexRow>
                        <FlexCol width="auto" title>
                            Publisher
                        </FlexCol>
                        <FlexCol width="10em">
                            PUBLISHER READ ONLY HERE
                        </FlexCol>
                        <FlexCol width="auto" title>
                            Date
                        </FlexCol>
                        <FlexCol width="10em">
                            DATE READ ONLY HERE
                        </FlexCol>
                        <FlexCol width="auto" title>
                            URL
                        </FlexCol>
                        <FlexCol width="16em">
                            URL READ ONLY HERE
                        </FlexCol>
                    </FlexRow>
                    <FlexRow header>Citation</FlexRow>
                    <FlexRow>
                        <FlexCol width="8em" title>
                            Format
                        </FlexCol>
                        <FlexCol>CITATION FORMAT HERE</FlexCol>
                    </FlexRow>
                    <FlexRow>
                        <FlexCol width="8em" title>
                            Citation
                        </FlexCol>
                        <FlexCol>CITATION HERE</FlexCol>
                    </FlexRow>
                    <FlexRow>
                        <FlexCol width="8em" title>
                            Description
                        </FlexCol>
                        <FlexCol>
                            <StringEditor field={this.props.work.shortDescription} label="Description" onEdit={this.onShortDescriptionEdit.bind(this)} />
                        </FlexCol>
                    </FlexRow>

                    <FlexRow header>Your Contribution</FlexRow>
                    <FlexRow>
                        <FlexCol style={{ flex: '1 1 0' }}>
                            <Well variant="secondary" border="2">
                                <Well.Body style={{ padding: '0.5em' }}>
                                    SELF CONTRIBUTOR HERE
                                </Well.Body>
                            </Well>
                        </FlexCol>
                    </FlexRow>

                    <FlexRow header>Other Contributors</FlexRow>
                    <FlexRow>
                        <FlexCol style={{ flex: '1 1 0' }}>
                            OTHER CONTRIBUTORS HERE
                        </FlexCol>
                    </FlexRow>

                    <FlexRow header>DOI</FlexRow>
                    <FlexRow>
                        <FlexCol width="14em">
                            DOI HERE
                        </FlexCol>
                    </FlexRow>

                    <FlexRow header>Other External Identifiers</FlexRow>
                    <FlexRow>
                        <FlexCol style={{ flex: '1 1 0' }}>EXTERNAL IDS HERE</FlexCol>
                    </FlexRow>
                </FlexGrid>
            </Form>
        );
    }

    render() {
        return (
            <Well variant="primary" style={{ flex: '1 1 0', marginBottom: '1em' }}>
                <Well.Header>Edit Work Record</Well.Header>
                <Well.Body style={{ padding: 'none' }}>
                    <ScrollingArea>{this.renderForm()}</ScrollingArea>
                </Well.Body>
                <Well.Footer style={{ justifyContent: 'center' }}>
                    <Stack direction="horizontal" gap={3}>
                        <Button variant="primary" onClick={this.doSave.bind(this)}
                            disabled={!this.state.canSave}>
                            <span className="fa fa-floppy-o" /> Save
                        </Button>
                        <Button
                            variant="outline-danger"
                            type="button"
                            onClick={() => {
                                changeHash2('/narrativepublishing');
                            }}
                        >
                            <span className="fa fa-mail-reply" /> Return to Narrative Publishing
                            Manager
                        </Button>
                    </Stack>
                </Well.Footer>
            </Well>
        );
    }
}
