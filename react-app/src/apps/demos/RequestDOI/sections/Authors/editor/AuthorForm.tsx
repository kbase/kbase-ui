import Well from 'components/Well';
import { Component } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Stack } from 'react-bootstrap';
import { FormDropdownStringField } from '../../formFields/FormDropdownStringField';
import { FormStringField } from '../../formFields/FormStringField';
import { EditableAuthor } from './AuthorsSectionController';

export interface AuthorFormProps {
    author: EditableAuthor;
    onEditFirstName: (value: string) => Promise<void>;
    onEditMiddleName: (value: string) => Promise<void>;
    onEditLastName: (value: string) => Promise<void>;
    onEditInstitution: (value: string) => Promise<void>;
    onEditEmailAddress: (value: string) => Promise<void>;
    onEditORCIDId: (value: string) => Promise<void>;
    onEditContributorType: (value: string) => Promise<void>;
    onCancel: () => Promise<void>;
    onImportFromORCID: () => Promise<void>;
}

interface AuthorFormState {}

export default class AuthorForm extends Component<AuthorFormProps, AuthorFormState> {
    orcidIdIsReady() {
        return this.props.author.orcidIdField.isValid();
    }
    render() {
        return (
            <Well variant="secondary">
                <Well.Header>Author Form</Well.Header>
                <Well.Body>
                    <Stack gap={2}>
                        <FormStringField
                            field={this.props.author.firstName}
                            label="First name"
                            onEdit={this.props.onEditFirstName}
                        />
                        <FormStringField
                            field={this.props.author.middleName}
                            label="Middle name"
                            onEdit={this.props.onEditMiddleName}
                        />
                        <FormStringField
                            field={this.props.author.lastName}
                            label="Last name"
                            onEdit={this.props.onEditLastName}
                        />
                        <FormStringField
                            field={this.props.author.institutionField}
                            label="Institution"
                            onEdit={this.props.onEditInstitution}
                        />
                        <FormStringField
                            field={this.props.author.emailAddressField}
                            label="Email"
                            onEdit={this.props.onEditEmailAddress}
                        />
                        <FormStringField
                            field={this.props.author.orcidIdField}
                            label="ORCID Id"
                            onEdit={this.props.onEditORCIDId}
                        />
                        <FormDropdownStringField
                            field={this.props.author.contributorType}
                            label="Type"
                            onEdit={this.props.onEditContributorType}
                        />
                    </Stack>
                </Well.Body>
                <Well.Footer style={{ justifyContent: 'center' }}>
                    <ButtonToolbar style={{ justifyContent: 'center' }}>
                        <ButtonGroup>
                            <Button
                                variant="outline-primary"
                                disabled={!this.orcidIdIsReady()}
                                onClick={this.props.onImportFromORCID.bind(this)}
                            >
                                Import from ORCID
                            </Button>
                            <Button variant="outline-danger" onClick={this.props.onCancel}>
                                Close
                            </Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                </Well.Footer>
            </Well>
        );
    }
}
