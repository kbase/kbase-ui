import Empty from "components/Empty";
import { Component } from "react";
import { Button } from "react-bootstrap";
import Select from 'react-select';
import { Options, Option } from "./reactSelectTypes";


import { WorkExternalIdentifierTypes, WorkRelationshipIdentifiers } from "apps/ORCIDLink/data";
import { EditableExternalId, externalIdToEditableExternalId } from "./PushPublicationModel";

export interface EditExternalIdentifiersProps {
    workExternalIdentifierTypes: WorkExternalIdentifierTypes;
    workRelationshipIdentifiers: WorkRelationshipIdentifiers;
    externalIds: Array<EditableExternalId>;
    onChanged: (editState: Array<EditableExternalId>) => void;
}

interface EditExternalIdentifiersState {
    externalIds: Array<EditableExternalId>;
}

export default class EditExternalIdentifiers extends Component<EditExternalIdentifiersProps, EditExternalIdentifiersState> {
    constructor(props: EditExternalIdentifiersProps) {
        super(props);
        this.state = {
            externalIds: this.props.externalIds
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
        const externalIds = this.state.externalIds.slice();
        externalIds[index].type.editValue = type;
        externalIds[index].type.value = type;

        this.setState({
            externalIds
        }, () => {
            this.props.onChanged(this.state.externalIds);
        })
    }

    changeExternalIdValue(value: string, index: number) {
        const externalIds = this.state.externalIds.slice();
        externalIds[index].value.editValue = value;
        externalIds[index].value.value = value;

        this.setState({
            externalIds
        }, () => {
            this.props.onChanged(this.state.externalIds);
        })
    }

    changeExternalIdRelationship(value: string, index: number) {
        const externalIds = this.state.externalIds.slice();
        externalIds[index].relationship.editValue = value;
        externalIds[index].relationship.value = value;

        this.setState({
            externalIds
        }, () => {
            this.props.onChanged(this.state.externalIds);
        })
    }

    changeExternalIdURL(url: string, index: number) {
        const externalIds = this.state.externalIds.slice();
        externalIds[index].url.editValue = url;
        externalIds[index].url.value = url;

        this.setState({
            externalIds
        }, () => {
            this.props.onChanged(this.state.externalIds);
        })
    }

    handleRemoveExternalIdentifier(indexToRemove: number) {
        const externalIds = this.state.externalIds.filter((_, index) => {
            return (index !== indexToRemove);
        });
        this.setState({
            externalIds
        }, () => {
            this.props.onChanged(this.state.externalIds);
        });
    }

    addExternalIdentifier() {
        const externalIds = this.state.externalIds.slice();
        externalIds.push(externalIdToEditableExternalId({
            type: '',
            relationship: '',
            url: '',
            value: ''
        }));
        this.setState({
            externalIds
        })
    }

    renderTable() {
        if (this.state.externalIds.length === 0) {
            return <Empty message="No external identifiers ... yet" />
        }
        const relationships = this.getExternalRelationshipIdentifiers();
        const identifierTypes = this.getExternalIdentifierTypes();
        const rows = this.state.externalIds.map(({ type, url, value, relationship }, index) => {
            const currentRelationship = relationships.filter(({ value }) => {
                return (relationship.value === value);
            })[0];
            const currentIdentifierType = identifierTypes.filter(({ value }) => {
                return (type.value === value);
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
                        value={value.editValue}
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
                        value={url.editValue}
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