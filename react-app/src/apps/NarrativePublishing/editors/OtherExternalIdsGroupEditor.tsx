import Empty from 'components/Empty';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, ButtonToolbar, Stack } from 'react-bootstrap';
import FlexGrid, { FlexCol, FlexRow } from '../common/FlexGrid';
import { createExternalIdGroup } from '../EditWork2/Controller';
import { ValueStatus } from '../fields/Field';
import { ExternalIdGroup } from '../workFields/ExternalIdGroup';
import { OtherExternalIdsGroup, OtherExternalIdsGroupUtil } from '../workFields/OtherExternalIdsGroup';
import { renderFieldEditStatusClasses, renderFieldValidationIcon, renderFieldValidationMessage, renderHeaderValidationIcon } from './common';
import ExternalIdGroupEditor from './ExternalIdGroupEditor';

export interface OtherExternalIdsGroupEditorProps {
    debug?: boolean;
    field: OtherExternalIdsGroup
    save: (field: OtherExternalIdsGroup) => void;
}

export default class OtherExternalIdsGroupEditor extends Component<
    OtherExternalIdsGroupEditorProps
> {
    changed(changedGroup: OtherExternalIdsGroup): void {
        this.props.save(new OtherExternalIdsGroupUtil(changedGroup).evaluate());
    }

    renderExternalIdControl(externalIdGroup: ExternalIdGroup, index: number) {
        const save = (externalIdGroupToSave: ExternalIdGroup) => {
            if (externalIdGroupToSave.editValue.status !== ValueStatus.SOME) {
                return "not ready";
            }

            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return "not ready";
            }

            const otherExternalIds = field.editValue.value;

            otherExternalIds.splice(index, 1, externalIdGroupToSave)

            // TODO: something is not quite right about all this...
            const newField: OtherExternalIdsGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: otherExternalIds
                }
            }
            this.changed(newField);
        }

        return <ExternalIdGroupEditor
            debug={this.props.debug}
            field={externalIdGroup}
            save={save}
        />
    }

    delete(index: number) {
        const field = this.props.field;

        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }

        const externalIds = field.editValue.value;

        externalIds.splice(index, 1)

        // TODO: something is not quite right about all this...
        const newField: OtherExternalIdsGroup = {
            ...field,
            editValue: {
                ...field.editValue,
                value: externalIds
            }
        }
        this.changed(newField);
    }


    renderOtherExternalIds() {
        if (this.props.field.editValue.status !== ValueStatus.SOME) {
            return <Empty message="No external ids" />;
        }
        const onRemove = (indexToRemove: number) => {
            this.delete(indexToRemove);
        };
        const externalIds = this.props.field.editValue.value.map((externalId, index) => {
            return (
                <Well variant="secondary" key={index} border="2" padding="0.5em" orientation="horizontal">
                    <Well.Body>
                        {this.renderExternalIdControl(externalId, index)}
                    </Well.Body>
                    <Well.Footer style={{ justifyContent: 'center' }}>
                        <Button
                            variant="outline-danger"
                            onClick={() => {
                                onRemove(index);
                            }}
                        >
                            <span className="fa fa-trash" />
                        </Button>
                    </Well.Footer>
                </Well>
            );
        });
        return <Stack gap={2}>
            {externalIds}
        </Stack>
    }

    addExternalId() {
        const field = this.props.field;

        if (field.editValue.status === ValueStatus.NONE) {
            return "not ready";
        }

        const otherContributors = (() => {
            switch (field.editValue.status) {
                case ValueStatus.EMPTY:
                    return [];
                case ValueStatus.SOME:
                    return field.editValue.value;
            }
        })();

        otherContributors.push(createExternalIdGroup({
            type: '',
            value: '',
            url: '',
            relationship: ''
        }));

        // TODO: something is not quite right about all this...
        const newField: OtherExternalIdsGroup = {
            ...field,
            editValue: {
                status: ValueStatus.SOME,
                value: otherContributors
            }
        }
        this.changed(newField);
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
                <FlexRow header className={this.props.debug ? borderClasses : ''}>
                    External Identifiers {' '} <span style={{ marginLeft: '1em' }}>{headerValidationIcon}</span>
                </FlexRow>
                <FlexRow>
                    <FlexCol>
                        {this.renderOtherExternalIds()}
                    </FlexCol>
                </FlexRow>
                <FlexRow>
                    <FlexCol style={{ alignItems: 'center' }}>
                        <ButtonToolbar>
                            <Button variant="outline-primary" onClick={this.addExternalId.bind(this)}>
                                <span className="fa fa-plus-circle" /> Add External Id
                            </Button>
                        </ButtonToolbar>
                    </FlexCol>
                </FlexRow>
            </FlexGrid>
        );
    }
}
