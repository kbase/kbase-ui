import { EditableExternalIds, ExternalId } from "apps/ORCIDLink/Model";
import Empty from "components/Empty";
import { Component } from "react";
import { Button } from "react-bootstrap";
import Select from 'react-select';
import { Options, Option } from "./reactSelectTypes";


import { WorkTypes2 } from "./Add/Controller";
import { WorkExternalIdentifierTypes, WorkRelationshipIdentifiers } from "apps/ORCIDLink/data";

export interface EditExternalIdentifiersProps {
    workExternalIdentifierTypes: WorkExternalIdentifierTypes;
    workRelationshipIdentifiers: WorkRelationshipIdentifiers;
    externalIds: Array<ExternalId>;
    onChanged: (editState: Array<ExternalId>) => void;
}

interface EditExternalIdentifiersState {
    editState: EditableExternalIds;
}

export default class EditExternalIdentifiers extends Component<EditExternalIdentifiersProps, EditExternalIdentifiersState> {
    constructor(props: EditExternalIdentifiersProps) {
        super(props);
        this.state = {
            editState: {
                externalIds: this.props.externalIds
            }
        }
    }

    getExternalIdentifierTypes(): Options<string> {
        return this.props.workExternalIdentifierTypes.map(({ value, description }) => {
            return {
                value,
                label: description
            };
        });
    }

    getExternalRelationshipIdentifiers(): Options<string> {
        return this.props.workRelationshipIdentifiers.map(({ value, label }) => {
            return {
                value,
                label
            };
        });
    }

    handleChangeExternalIdType(type: string, index: number) {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds[index].type = type;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        }, () => {
            this.props.onChanged(this.state.editState.externalIds);
        })
    }

    changeExternalIdValue(value: string, index: number) {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds[index].value = value;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        }, () => {
            this.props.onChanged(this.state.editState.externalIds);
        })
    }

    changeExternalIdRelationship(value: string, index: number) {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds[index].relationship = value;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        }, () => {
            this.props.onChanged(this.state.editState.externalIds);
        })
    }

    changeExternalIdURL(url: string, index: number) {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds[index].url = url;

        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        }, () => {
            this.props.onChanged(this.state.editState.externalIds);
        })
    }

    handleRemoveExternalIdentifier(indexToRemove: number) {
        const externalIds = this.state.editState.externalIds.filter((identifier, index) => {
            return (index !== indexToRemove);
        });
        this.setState({
            editState: {
                ...this.state.editState,
                externalIds
            }
        }, () => {
            this.props.onChanged(this.state.editState.externalIds);
        });
    }

    addExternalIdentifier() {
        const externalIds = this.state.editState.externalIds.slice();
        externalIds.push({
            type: '',
            relationship: '',
            url: '',
            value: ''
        });
        this.setState({
            ...this.state,
            editState: {
                ...this.state.editState,
                externalIds
            }
        })
    }

    renderTable() {
        if (this.state.editState.externalIds.length === 0) {
            return <Empty message="No external identifiers ... yet" />
        }
        const relationships = this.getExternalRelationshipIdentifiers();
        const identifierTypes = this.getExternalIdentifierTypes();
        const rows = this.state.editState.externalIds.map(({ type, url, value, relationship }, index) => {
            const currentRelationship = relationships.filter(({ value }) => {
                return (relationship === value);
            })[0];
            const currentIdentifierType = identifierTypes.filter(({ value }) => {
                return (type === value);
            })[0];
            return <div className="flex-row" key={index}>
                <div className="flex-col">
                    <Select<Option<string>>
                        styles={{ menu: (css) => ({ ...css, width: 'max-content', maxWidth: '20em' }) }}
                        isSearchable={false}
                        defaultValue={currentIdentifierType}
                        onChange={(newValue) => { this.handleChangeExternalIdType(newValue!.value, index) }}
                        options={this.getExternalIdentifierTypes()}
                    />
                </div>
                <div className="flex-col">
                    <input type="text" className="form-control"
                        value={value}
                        style={{ margin: '0' }}
                        onInput={(e) => { this.changeExternalIdValue(e.currentTarget.value, index) }} />
                </div>
                <div className="flex-col">
                    <Select<Option<string>>
                        styles={{ menu: (css) => ({ ...css, width: 'max-content', maxWidth: '20em' }) }}
                        isSearchable={false}
                        defaultValue={currentRelationship}
                        onChange={(newValue) => { this.changeExternalIdRelationship(newValue!.value, index) }}
                        options={relationships}
                    />
                    {/* <input type="text" className="form-control"
                        value={relationship}
                        style={{ margin: '0' }}
                        onInput={(e) => { this.changeExternalIdRelationship(e.currentTarget.value, index) }} /> */}
                </div>
                <div className="flex-col">
                    <input type="text" className="form-control"
                        value={url}
                        style={{ margin: '0' }}
                        onInput={(e) => { this.changeExternalIdURL(e.currentTarget.value, index) }} />
                </div>
                <div className="flex-col" style={{ alignItems: 'center', flex: '0 0 auto' }}>
                    <Button variant="danger">
                        <span className="fa fa-trash" onClick={() => { this.handleRemoveExternalIdentifier(index); }} />
                    </Button>
                </div>
            </div>
        });
        return <div className="flex-table">
            <div className="flex-row -header">
                <div className="flex-col">
                    Type
                </div>
                <div className="flex-col">
                    Value
                </div>
                <div className="flex-col">
                    Relationship
                </div>
                <div className="flex-col">
                    URL
                </div>
            </div>
            {rows}
        </div>
    }

    render() {
        return <div>
            <div style={{ marginBottom: '1em', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                <Button variant="primary" size="sm" onClick={this.addExternalIdentifier.bind(this)} style={{ marginLeft: '1em' }}>
                    <span className="fa fa-plus-circle" /> Add New External Identifier
                </Button>
            </div>
            {this.renderTable()}
        </div>
    }
}