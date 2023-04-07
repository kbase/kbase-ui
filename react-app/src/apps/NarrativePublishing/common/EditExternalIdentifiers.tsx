import Empty from 'components/Empty';
import { Options } from 'lib/reactSelectTypes';
import { Component } from 'react';
import { Button, Form } from 'react-bootstrap';
// import Select from 'react-select';

import { WorkExternalIdentifierTypes, WorkRelationshipIdentifiers } from 'apps/ORCIDLink/data';
import { EditableExternalId, externalIdToEditableExternalId } from '../Model';
import FlexGrid, { FlexCol, FlexRow } from './FlexGrid';

export interface EditExternalIdentifiersProps {
    workExternalIdentifierTypes: WorkExternalIdentifierTypes;
    workRelationshipIdentifiers: WorkRelationshipIdentifiers;
    externalIds: Array<EditableExternalId>;
    onChanged: (editState: Array<EditableExternalId>) => void;
}

interface EditExternalIdentifiersState {
    externalIds: Array<EditableExternalId>;
}

export default class EditExternalIdentifiers extends Component<
    EditExternalIdentifiersProps,
    EditExternalIdentifiersState
> {
    constructor(props: EditExternalIdentifiersProps) {
        super(props);
        this.state = {
            externalIds: this.props.externalIds,
        };
    }

    getExternalIdentifierTypes(): Options<string> {
        return this.props.workExternalIdentifierTypes.map(({ value, description }) => {
            return {
                value,
                label: description,
            };
        });
    }

    getExternalRelationshipIdentifiers(): Options<string> {
        return this.props.workRelationshipIdentifiers
            .map(({ value, label }) => {
                return {
                    value,
                    label,
                };
            })
            .sort(({ label: labelA }, { label: labelB }) => {
                return labelA.localeCompare(labelB);
            });
    }

    handleChangeExternalIdType(type: string, index: number) {
        const externalIds = this.state.externalIds.slice();
        externalIds[index].type.editValue = type;
        externalIds[index].type.value = type;

        this.setState(
            {
                externalIds,
            },
            () => {
                this.props.onChanged(this.state.externalIds);
            }
        );
    }

    changeExternalIdValue(value: string, index: number) {
        const externalIds = this.state.externalIds.slice();
        externalIds[index].value.editValue = value;
        externalIds[index].value.value = value;

        this.setState(
            {
                externalIds,
            },
            () => {
                this.props.onChanged(this.state.externalIds);
            }
        );
    }

    changeExternalIdRelationship(value: string, index: number) {
        const externalIds = this.state.externalIds.slice();
        externalIds[index].relationship.editValue = value;
        externalIds[index].relationship.value = value;

        this.setState(
            {
                externalIds,
            },
            () => {
                this.props.onChanged(this.state.externalIds);
            }
        );
    }

    changeExternalIdURL(url: string, index: number) {
        const externalIds = this.state.externalIds.slice();
        externalIds[index].url.editValue = url;
        externalIds[index].url.value = url;

        this.setState(
            {
                externalIds,
            },
            () => {
                this.props.onChanged(this.state.externalIds);
            }
        );
    }

    handleRemoveExternalIdentifier(indexToRemove: number) {
        const externalIds = this.state.externalIds.filter((_, index) => {
            return index !== indexToRemove;
        });
        this.setState(
            {
                externalIds,
            },
            () => {
                this.props.onChanged(this.state.externalIds);
            }
        );
    }

    addExternalIdentifier() {
        const externalIds = this.state.externalIds.slice();
        externalIds.push(
            externalIdToEditableExternalId({
                type: '',
                relationship: '',
                url: '',
                value: '',
            })
        );
        this.setState({
            externalIds,
        });
    }

    renderTable() {
        if (this.state.externalIds.length === 0) {
            return <Empty message="No external identifiers ... yet" />;
        }
        // const relationships = this.getExternalRelationshipIdentifiers();
        // const identifierTypes = this.getExternalIdentifierTypes();
        const rows = this.state.externalIds.map(({ type, url, value, relationship }, index) => {
            // const currentRelationship = relationships.filter(({ value }) => {
            //     return relationship.value === value;
            // })[0];
            // const currentIdentifierType = identifierTypes.filter(({ value }) => {
            //     return type.value === value;
            // })[0];
            // TODO: ensure that the type select scrolls the current selection into view.
            //
            // const onMenuOpen = () => {
            //     setTimeout(() => {
            //     const { focusedOptionRef } = selectRef.current.select;

            //     focusedOptionRef &&
            //         focusedOptionRef.scrollIntoView({ behavior: "smooth" });
            //     }, 1);
            // };
            //
            // onMenuOpen={() => { } }
            // TODO: replace with regular select; for simply cases we should just use
            // Bootstrap selects - much simpler, more reliable.
            const typeOptions = this.getExternalIdentifierTypes().map(({ value, label }) => {
                const selected = value === type.value;
                return (
                    <option key={value} value={value} selected={selected}>
                        {label}
                    </option>
                );
            });
            typeOptions.unshift(<option key="blank" value=""></option>);

            const relationshipOptions = this.getExternalRelationshipIdentifiers().map(
                ({ value, label }) => {
                    const selected = value === relationship.value;
                    return (
                        <option key={value} value={value} selected={selected}>
                            {label}
                        </option>
                    );
                }
            );
            relationshipOptions.unshift(<option key="blank" value=""></option>);

            return (
                <FlexRow key={index}>
                    <FlexCol width="20em">
                        <Form.Select
                            onChange={(ev) => {
                                this.handleChangeExternalIdType(ev.target.value, index);
                            }}
                        >
                            {typeOptions}
                        </Form.Select>
                    </FlexCol>
                    <FlexCol width="10em">
                        <Form.Select
                            onChange={(ev) => {
                                this.changeExternalIdRelationship(ev.target.value, index);
                            }}
                        >
                            {relationshipOptions}
                        </Form.Select>
                    </FlexCol>
                    <FlexCol>
                        <input
                            type="text"
                            className="form-control"
                            value={value.editValue}
                            style={{ margin: '0' }}
                            onInput={(e) => {
                                this.changeExternalIdValue(e.currentTarget.value, index);
                            }}
                        />
                    </FlexCol>
                    <FlexCol>
                        <input
                            type="text"
                            className="form-control"
                            value={url.editValue}
                            style={{ margin: '0' }}
                            onInput={(e) => {
                                this.changeExternalIdURL(e.currentTarget.value, index);
                            }}
                        />
                    </FlexCol>
                    <FlexCol width="3em" style={{ alignItems: 'center' }}>
                        <Button
                            variant="outline-danger"
                            onClick={() => {
                                this.handleRemoveExternalIdentifier(index);
                            }}
                        >
                            <span className="fa fa-trash" />
                        </Button>
                    </FlexCol>
                </FlexRow>
            );
        });
        return (
            <FlexGrid>
                <FlexRow>
                    <FlexCol width="20em" title>
                        Type
                    </FlexCol>
                    <FlexCol width="10em" title>
                        Relationship
                    </FlexCol>
                    <FlexCol title>Value</FlexCol>
                    <FlexCol title>URL</FlexCol>
                    <FlexCol width="3em"></FlexCol>
                </FlexRow>
                {rows}
            </FlexGrid>
        );
    }

    render() {
        return (
            <div>
                {this.renderTable()}
                <div
                    style={{
                        margin: '1em 0',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                    }}
                >
                    <Button
                        variant="outline-primary"
                        onClick={this.addExternalIdentifier.bind(this)}
                    >
                        <span className="fa fa-plus-circle" /> Add New External Identifier
                    </Button>
                </div>
            </div>
        );
    }
}
