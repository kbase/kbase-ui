import Well from 'components/Well';
import { changeHash2 } from 'lib/navigation';
import { Component } from 'react';
import Button from 'react-bootstrap/esm/Button';
import Stack from 'react-bootstrap/esm/Stack';
import { FlexCol, FlexRow } from '../common/FlexGrid';
import ScrollingArea from '../common/ScrollingArea';
import {
    renderFieldEditStatusClasses, renderFieldValidationIcon,
    renderFieldValidationMessage, renderHeaderValidationIcon
} from '../editors/common';
import WorkEditor from '../editors/WorkEditor';
import { WorkGroup } from '../workFields/WorkGroup';

export interface EditWorkProps {
    work: WorkGroup;
    canSave: boolean;
    save: () => void;
    update: (workGroup: WorkGroup) => void;
}

interface EditWorkState {
    debug: boolean;
}

export default class EditWork extends Component<EditWorkProps, EditWorkState> {
    constructor(props: EditWorkProps) {
        super(props);
        this.state = {
            debug: false
        }
    }

    renderWorkEditor() {
        return (
            <WorkEditor
                debug={this.state.debug}
                update={this.props.update}
                field={this.props.work}
            />
        );
    }

    toggleDebug() {
        this.setState({
            debug: !this.state.debug
        });
    }

    render() {
        const field = this.props.work;
        const { backgroundColorClasses, borderClasses } = renderFieldEditStatusClasses(field);
        const validationIcon = renderFieldValidationIcon(field);
        const headerValidationIcon = renderHeaderValidationIcon(field);
        const validationMessage = renderFieldValidationMessage(field);

        // const validationRow = (() => {
        //     if (validationMessage) {
        //         return <FlexRow>{validationMessage}</FlexRow>
        //     }
        // })();

        return (
            <Well variant="primary" style={{ flex: '1 1 0', marginBottom: '1em' }}>
                <Well.Header>
                    <FlexRow>
                        <FlexCol>
                            <FlexRow>
                                Edit Work Record {' '} <span style={{ marginLeft: '1em' }}>{headerValidationIcon}</span>
                            </FlexRow>
                        </FlexCol>
                        <FlexCol style={{ alignItems: 'flex-end' }}>
                            <Button
                                onClick={this.toggleDebug.bind(this)}
                            >{this.state.debug ? 'no debug' : 'debug'}</Button>
                        </FlexCol>
                    </FlexRow>
                </Well.Header>
                <Well.Body style={{ padding: 'none' }}>
                    <ScrollingArea>{this.renderWorkEditor()}</ScrollingArea>
                </Well.Body>
                <Well.Footer style={{ justifyContent: 'center' }}>
                    <Stack direction="horizontal" gap={3}>
                        <Button
                            variant="primary"
                            onClick={this.props.save}
                            disabled={!this.props.canSave}>
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
