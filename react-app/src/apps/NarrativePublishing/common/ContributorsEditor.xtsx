import Empty from 'components/Empty';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Stack } from 'react-bootstrap';
import {
    EditableContributor, EditableContributors, EditStatus,
    newEditableContributor,
    ValidationState, ValidationStatus
} from '../Model';
import ContributorEditor from './ContributorEditor';

export interface ContributorsEditorProps {
    contributors: EditableContributors;
    onChange: (contributors: EditableContributors) => void;
}

export default class ContributorsEditor extends Component<
    ContributorsEditorProps
> {
    evaluate() {
        // loop through all contributors, gathering our usual two flags -
        // are all fields valid? have any been changed?
        const areAllValid = this.props.contributors.editValue.every(({ validationState }) => {
            return validationState.status === ValidationStatus.VALID;
        })

        const validationState: ValidationState = (() => {
            if (areAllValid) {
                return {
                    status: ValidationStatus.VALID
                }
            }
            return {
                status: ValidationStatus.INVALID,
                message: 'One or more fields are invalid; please correct them'
            }
        })();

        const areAnyEdited = this.props.contributors.editValue.some(({ status }) => {
            return status === EditStatus.EDITED;
        });

        this.props.onChange({
            ...this.props.contributors,
            status: areAnyEdited ? EditStatus.EDITED : EditStatus.INITIAL,
            validationState,

            value: this.props.contributors.editValue.map(({ value }) => {
                return value;
            })
        });
    }

    onChanged(contributors: EditableContributors) {
        const areAllValid = this.props.contributors.editValue.every(({ validationState }) => {
            return validationState.status === ValidationStatus.VALID;
        });

        const validationState: ValidationState = (() => {
            if (areAllValid) {
                return {
                    status: ValidationStatus.VALID
                }
            }
            return {
                status: ValidationStatus.INVALID,
                message: 'One or more fields are invalid; please correct them'
            }
        })();

        const areAnyEdited = this.props.contributors.editValue.some(({ status }) => {
            return status === EditStatus.EDITED;
        });

        contributors.editValue.forEach(({ editValue: { name } }, index) => {
            console.log('onChanged', index, name)
        });

        this.props.onChange({
            ...this.props.contributors,
            status: areAnyEdited ? EditStatus.EDITED : EditStatus.INITIAL,
            validationState,
            editValue: contributors.editValue,
            value: this.props.contributors.editValue.map(({ value }) => {
                return value;
            })
        });
    }

    renderContributors() {
        if (this.props.contributors.editValue.length === 0) {
            return <Empty message="No contributors (other than yourself!)" />;
        }
        const onChanged = (contributor: EditableContributor, index: number) => {
            const contributors = this.props.contributors;

            contributors.editValue[index] = contributor;
            contributors.value[index] = contributor.value;

            this.onChanged(contributors);
        };
        const onRemove = (indexToRemove: number) => {
            const editValue = this.props.contributors.editValue.filter((_, index) => {
                return index !== indexToRemove;
            });
            const contributors = {
                ...this.props.contributors,
                editValue,
            };
            this.onChanged(contributors);
        };
        return this.props.contributors.editValue.map((editableContributor, index) => {
            return (
                <Well variant="secondary" key={index} border="2" padding="0.5em">
                    <Well.Body>
                        <ContributorEditor
                            contributor={editableContributor}
                            onChanged={(contributor: EditableContributor) => {
                                onChanged(contributor, index);
                            }}
                        />
                    </Well.Body>
                    <Well.Footer style={{ justifyContent: 'center' }}>
                        <Button
                            variant="outline-danger"
                            onClick={() => {
                                onRemove(index);
                            }}
                        >
                            <span className="fa fa-trash" /> Remove
                        </Button>
                    </Well.Footer>
                </Well>
            );
        });
    }

    addContributor() {
        const contributors = this.props.contributors;
        contributors.editValue.push(newEditableContributor());

        this.onChanged(contributors);
    }

    render() {
        return (
            <Stack gap={2}>
                {this.renderContributors()}
                <div>
                    <Button variant="outline-primary" onClick={this.addContributor.bind(this)}>
                        <span className="fa fa-plus-circle" /> Add Contributor
                    </Button>
                </div>
            </Stack>
        );
    }
}
