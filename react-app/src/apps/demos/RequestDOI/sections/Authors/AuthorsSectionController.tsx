
import { Author } from 'apps/ORCIDLink/ORCIDLinkClient';
import { uniqueId } from 'lib/kb_lib/Utils';
import { Component } from 'react';
import { Model } from '../../Model';
import { ImportableAuthor } from '../AuthorsImport/AuthorsImportSectionController';
import { ContributorTypeField, EmailAddressField, FirstNameField, InstitutionField, LastNameField, MiddleNameField, ORCIDIdField } from './AuthorFields';
import AuthorsSection from './AuthorsSection';
// import { EditableAuthor } from './types';

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
    authors: Array<ImportableAuthor>
    setTitle: (title: string) => void;
    onDone: (authors: Array<Author>) => void;
}

// export interface Author {
//     firstName: string;
//     middleName?: string;
//     lastName: string;
//     emailAddress?: string;
//     orcidId?: string;
//     institution: string;
// }

export interface AuthorsSectionControllerState {
    authors: Array<EditableAuthor>;
    selected: EditableAuthor | null;
}


export default class AuthorsSectionController extends Component<AuthorsSectionControllerProps, AuthorsSectionControllerState> {
    constructor(props: AuthorsSectionControllerProps) {
        super(props);

        const authors: Array<EditableAuthor> = props.authors.map(({ firstName, middleName, lastName, institution }) => {
            return {
                id: uniqueId(),
                firstName: new FirstNameField(true).initializeFromRaw(firstName || ''),
                middleName: new MiddleNameField(false).initializeFromRaw(middleName || ''),
                lastName: new LastNameField(true).initializeFromRaw(lastName || ''),
                institutionField: new InstitutionField(true).initializeFromRaw(institution || ''),
                emailAddressField: new EmailAddressField(true).initializeFromRaw(''),
                orcidIdField: new ORCIDIdField().initializeFromRaw(''),
                contributorType: new ContributorTypeField(true).initializeFromRaw('')
            };
        });

        this.state = {
            authors,
            selected: null
        }
    }

    // Model interaction

    onEditAuthor(author: EditableAuthor) {
        this.setState({
            selected: author
        });
    }

    onUpdateAuthor(author: EditableAuthor) {
        console.log('updating?');
        this.setState({
            authors: this.state.authors.slice()
        })
    }

    onDeleteAuthor(author: EditableAuthor) {
        this.setState({
            authors: this.state.authors.filter(({ id }) => {
                console.log('  er', id, author.id);
                return id !== author.id;
            })
        })
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
        console.log('on add author...');
        this.setState({
            authors: this.state.authors.concat([this.createEmptyEditableAuthor()])
        });
    }

    onDone() {
        // this.props.onDone(
        //     this.state.authors
        // )
    }

    render() {
        return <AuthorsSection
            authors={this.state.authors}
            selected={this.state.selected}
            onEdit={this.onEditAuthor.bind(this)}
            onDelete={this.onDeleteAuthor.bind(this)}
            onUpdate={this.onUpdateAuthor.bind(this)}
            onAdd={this.onAddAuthor.bind(this)}
        />
    }
}