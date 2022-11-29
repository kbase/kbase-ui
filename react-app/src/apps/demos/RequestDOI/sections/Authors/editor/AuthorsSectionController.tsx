import { Model } from 'apps/demos/RequestDOI/Model';
import { uniqueId } from 'lib/kb_lib/Utils';
import { Component } from 'react';
import { Author } from "../../../DOIRequestClient";
import { ImportableAuthor } from '../../AuthorsImport/editor/AuthorsImportSectionController';
import {
    ContributorTypeField, EmailAddressField, FirstNameField,
    InstitutionField, LastNameField, MiddleNameField, ORCIDIdField
} from './AuthorFields';
import AuthorsSection from './AuthorsSection';

export interface EditableAuthor {
    id: string;
    firstName: FirstNameField,
    middleName: MiddleNameField,
    lastName: LastNameField,
    institutionField: InstitutionField,
    emailAddressField: EmailAddressField,
    orcidIdField: ORCIDIdField,
    contributorType: ContributorTypeField
}

export interface AuthorsSectionControllerProps {
    model: Model;
    authors: Array<ImportableAuthor> | Array<Author>;
    setTitle: (title: string) => void;
    onDone: (authors: Array<Author>) => void;
}

export interface AuthorsSectionControllerState {
    authors: Array<EditableAuthor>;
    selected: EditableAuthor | null;
}

export default class AuthorsSectionController extends Component<AuthorsSectionControllerProps, AuthorsSectionControllerState> {
    constructor(props: AuthorsSectionControllerProps) {
        super(props);

        const authors: Array<EditableAuthor> = props.authors.map(({ firstName, middleName, lastName, emailAddress, institution, orcidId, contributorType }) => {
            return {
                id: uniqueId(),
                firstName: new FirstNameField(true).initializeFromRaw(firstName || ''),
                middleName: new MiddleNameField(false).initializeFromRaw(middleName || ''),
                lastName: new LastNameField(true).initializeFromRaw(lastName || ''),
                institutionField: new InstitutionField(true).initializeFromRaw(institution || ''),
                emailAddressField: new EmailAddressField(true).initializeFromRaw(emailAddress || ''),
                orcidIdField: new ORCIDIdField().initializeFromRaw(orcidId || ''),
                contributorType: new ContributorTypeField(true).initializeFromRaw(contributorType || '')
            };
        });

        this.state = {
            authors,
            selected: null
        };
    }

    // Model interaction

    onEditAuthor(author: EditableAuthor) {
        this.setState({
            selected: author
        });
    }

    onCancelEditAuthor() {
        this.setState({
            selected: null
        });
    }

    onUpdateAuthor(author: EditableAuthor) {
        this.setState({
            authors: this.state.authors.slice()
        })
    }

    onDeleteAuthor(author: EditableAuthor) {
        const newState: AuthorsSectionControllerState = {
            ...this.state,
            authors: this.state.authors.filter(({ id }) => {
                return id !== author.id;
            })
        };
        if (this.state.selected && this.state.selected === author) {
            newState.selected = null;
        }
        this.setState(newState);
    }

    createEmptyEditableAuthor() {
        return {
            id: uniqueId(),
            firstName: new FirstNameField(true).initializeFromRaw(''),
            middleName: new MiddleNameField(false).initializeFromRaw(''),
            lastName: new LastNameField(true).initializeFromRaw(''),
            institutionField: new InstitutionField(true).initializeFromRaw(''),
            emailAddressField: new EmailAddressField(true).initializeFromRaw(''),
            orcidIdField: new ORCIDIdField().initializeFromRaw(''),
            contributorType: new ContributorTypeField(true).initializeFromRaw('')
        };
    }

    onAddAuthor() {
        const newAuthor = this.createEmptyEditableAuthor();
        this.setState({
            authors: this.state.authors.concat([newAuthor]),
            selected: newAuthor
        });
    }

    onDone() {
        // Only proceed if all fields are valid for all authors:
        const allValid = this.state.authors.every(({ firstName, middleName, lastName, institutionField, emailAddressField, orcidIdField, contributorType }) => {
            return firstName.isValid() && middleName.isValid() && lastName.isValid() &&
                institutionField.isValid() && emailAddressField.isValid() && orcidIdField.isValid()
                && contributorType.isValid();
        })

        if (!allValid || this.state.authors.length === 0) {
            return;
        }

        const authors: Array<Author> = this.state.authors.map(({
            firstName, middleName, lastName, institutionField, emailAddressField,
            orcidIdField, contributorType }) => {
            return {
                firstName: firstName.getFinalValue(),
                middleName: middleName.getFinalValue(),
                lastName: lastName.getFinalValue(),
                institution: institutionField.getFinalValue(),
                emailAddress: emailAddressField.getFinalValue(),
                orcidId: orcidIdField.getFinalValue(),
                contributorType: contributorType.getFinalValue()
            };
        });

        this.props.onDone(authors);
    }

    render() {
        return <AuthorsSection
            authors={this.state.authors}
            selected={this.state.selected}
            onEdit={this.onEditAuthor.bind(this)}
            onCancelEdit={this.onCancelEditAuthor.bind(this)}
            onDelete={this.onDeleteAuthor.bind(this)}
            onUpdate={this.onUpdateAuthor.bind(this)}
            onAdd={this.onAddAuthor.bind(this)}
            onDone={this.onDone.bind(this)}
        />
    }
}
