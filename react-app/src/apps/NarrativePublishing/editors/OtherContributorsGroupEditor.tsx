import Empty from 'components/Empty';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, ButtonToolbar, Stack } from 'react-bootstrap';
import { createContributorGroup } from '../EditWork2/Controller';
import FlexGrid, { FlexCol, FlexRow } from '../common/FlexGrid';
import { ValueStatus } from '../fields/Field';
import { ContributorGroup } from '../workFields/ContributorGroup';
import { OtherContributorsGroup, OtherContributorsGroupUtil } from '../workFields/OtherContributorsGroup';
import ContributorGroupEditor from './ContributorGroupEditor';
import { renderFieldEditStatusClasses, renderFieldValidationIcon, renderFieldValidationMessage, renderHeaderValidationIcon } from './common';

export interface OtherContributorsGroupEditorProps {
    debug?: boolean;
    field: OtherContributorsGroup
    save: (field: OtherContributorsGroup) => void;
}

export default class OtherContributorsGroupEditor extends Component<
    OtherContributorsGroupEditorProps
> {
    changed(changedGroup: OtherContributorsGroup): void {
        this.props.save(new OtherContributorsGroupUtil(changedGroup).evaluate());
    }

    renderContributorControl(contributorGroup: ContributorGroup, index: number) {
        const save = (contributorToSave: ContributorGroup) => {
            if (contributorToSave.editValue.status !== ValueStatus.SOME) {
                return "not ready";
            }

            const field = this.props.field;

            if (field.editValue.status !== ValueStatus.SOME) {
                return "not ready";
            }

            const otherContributors = field.editValue.value;

            otherContributors.splice(index, 1, contributorToSave)

            // TODO: something is not quite right about all this...
            const newField: OtherContributorsGroup = {
                ...field,
                editValue: {
                    ...field.editValue,
                    value: otherContributors
                }
            }
            this.changed(newField);
        }

        return <ContributorGroupEditor
            debug={this.props.debug}
            field={contributorGroup}
            save={save}
        />
    }

    deleteContributor(index: number) {
        const field = this.props.field;

        if (field.editValue.status !== ValueStatus.SOME) {
            return "not ready";
        }

        const otherContributors = field.editValue.value;

        otherContributors.splice(index, 1)

        // TODO: something is not quite right about all this...
        const newField: OtherContributorsGroup = {
            ...field,
            editValue: {
                ...field.editValue,
                value: otherContributors
            }
        }
        this.changed(newField);
    }

    renderContributors() {
        if (this.props.field.editValue.status !== ValueStatus.SOME) {
            return <Empty message="No contributors (other than yourself!)" />;
        }
        const onRemove = (indexToRemove: number) => {
            this.deleteContributor(indexToRemove);
        };
        const contributors = this.props.field.editValue.value.map((contributor, index) => {
            return (
                <Well variant="secondary" key={index} border="2" padding="0.5em" orientation="horizontal">
                    <Well.Body>
                        {this.renderContributorControl(contributor, index)}
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
            {contributors}
        </Stack>
    }

    addContributor() {
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

        otherContributors.push(createContributorGroup({
            name: '',
            orcidId: '',
            roles: []
        }));

        // TODO: something is not quite right about all this...
        const newField: OtherContributorsGroup = {
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
                    Other Contributors {' '} <span style={{ marginLeft: '1em' }}>{headerValidationIcon}</span>
                </FlexRow>
                <FlexRow>
                    <FlexCol>
                        {this.renderContributors()}
                    </FlexCol>
                </FlexRow>
                <FlexRow>
                    <FlexCol style={{ alignItems: 'center' }}>
                        <ButtonToolbar>
                            <Button variant="outline-primary" onClick={this.addContributor.bind(this)}>
                                <span className="fa fa-plus-circle" /> Add Contributor
                            </Button>
                        </ButtonToolbar>
                    </FlexCol>
                </FlexRow>
            </FlexGrid>
        );
    }
}
