import AlertMessage from 'components/AlertMessage';
import DataBrowser, { ColumnDef, optionalStringComparator } from 'components/DataBrowser';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { FieldStatus } from '../../Field';
import AuthorForm from './AuthorFormController';
import { EditableAuthor } from './AuthorsSectionController';

export interface AuthorsSectionProps {
    authors: Array<EditableAuthor>;
    selected: EditableAuthor | null;
    onCancelEdit: () => void;
    onEdit: (author: EditableAuthor) => void;
    onDelete: (author: EditableAuthor) => void;
    onUpdate: (author: EditableAuthor) => void;
    onAdd: () => void;
    onDone: () => void;
}

interface AuthorsSectionState {}

export default class AuthorsSection extends Component<AuthorsSectionProps, AuthorsSectionState> {
    constructor(props: AuthorsSectionProps) {
        super(props);
        this.state = {};
    }

    renderAuthors2() {
        if (this.props.authors.length === 0) {
            return (
                <AlertMessage variant="warning">You must provide one or more authors.</AlertMessage>
            );
        }

        const columns: Array<ColumnDef<EditableAuthor>> = [
            {
                id: 'status',
                label: '',
                style: {
                    flex: '0 0 2em',
                },
                render: (author: EditableAuthor) => {
                    if (
                        author.firstName.isValid() &&
                        author.middleName.isValid() &&
                        author.lastName.isValid() &&
                        author.institutionField.isValid() &&
                        author.emailAddressField.isValid() &&
                        author.orcidIdField.isValid() &&
                        author.contributorType.isValid()
                    ) {
                        return <span className="fa fa-check text-success" />;
                    }
                    return <span className="fa fa-exclamation-triangle text-danger" />;
                },
            },
            {
                id: 'firstName',
                label: 'First name',
                style: {
                    flex: '1.5 1 0',
                },
                render: (author: EditableAuthor) => {
                    switch (author.firstName.fieldState.status) {
                        case FieldStatus.NONE:
                        case FieldStatus.REQUIRED_EMPTY:
                        case FieldStatus.INVALID:
                        case FieldStatus.UNTRANSFORMABLE:
                            return (
                                <div className="bg-danger text-center">
                                    <span className="fa fa-exclamation-circle fa-inverse" />
                                </div>
                            );
                        case FieldStatus.VALID:
                            return <span>{author.firstName.fieldState.editValue}</span>;
                    }
                },
                sorter: (a: EditableAuthor, b: EditableAuthor) => {
                    return optionalStringComparator(
                        a.firstName.getEditValue(),
                        b.firstName.getEditValue()
                    );
                },
            },
            {
                id: 'lastName',
                label: 'Last name',
                style: {
                    flex: '1.5 1 0',
                },
                render: (author: EditableAuthor) => {
                    switch (author.lastName.fieldState.status) {
                        case FieldStatus.NONE:
                        case FieldStatus.REQUIRED_EMPTY:
                        case FieldStatus.INVALID:
                        case FieldStatus.UNTRANSFORMABLE:
                            return (
                                <div className="bg-danger text-center">
                                    <span className="fa fa-exclamation-circle fa-inverse" />
                                </div>
                            );
                        case FieldStatus.VALID:
                            return <span>{author.lastName.fieldState.editValue}</span>;
                    }
                },
                sorter: (a: EditableAuthor, b: EditableAuthor) => {
                    return optionalStringComparator(
                        a.lastName.getEditValue(),
                        b.lastName.getEditValue()
                    );
                },
            },
            // {
            //     id: 'orcidId',
            //     label: 'ORCID?',
            //     style: {
            //         flex: '0 0 3em'
            //     },
            //     render: (row: EditableAuthor) => {
            //         if (row.orcidIdField.getEditValue().length > 0) {
            //             return <span className="fa fa-check text-success" />
            //         }
            //         return <span className="fa fa-ban text-warning" />
            //     }
            // },
            {
                id: 'type',
                label: 'Type',
                style: {
                    flex: '1 1 0',
                },
                render: (author: EditableAuthor) => {
                    switch (author.contributorType.fieldState.status) {
                        case FieldStatus.NONE:
                        case FieldStatus.REQUIRED_EMPTY:
                        case FieldStatus.INVALID:
                        case FieldStatus.UNTRANSFORMABLE:
                            return (
                                <div className="bg-danger text-center">
                                    <span className="fa fa-exclamation-circle fa-inverse" />
                                </div>
                            );
                        case FieldStatus.VALID:
                            return <span>{author.contributorType.fieldState.editValue}</span>;
                    }
                },
                sorter: (a: EditableAuthor, b: EditableAuthor) => {
                    return a.contributorType
                        .getEditValue()
                        .localeCompare(b.contributorType.getEditValue());
                },
            },
            {
                id: 'buttons',
                label: '',
                style: {
                    flex: '0 0 5em',
                    alignItems: 'flex-end',
                },
                render: (author: EditableAuthor) => {
                    return (
                        <span>
                            <Button
                                variant="outline-primary"
                                style={{ border: 'none', padding: '0.25em' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.props.onEdit(author);
                                }}
                            >
                                <span className="fa fa-edit" />
                            </Button>
                            <Button
                                variant="outline-danger"
                                style={{ border: 'none', padding: '0.25em' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    this.props.onDelete(author);
                                }}
                            >
                                <span className="fa fa-trash" />
                            </Button>
                        </span>
                    );
                },
            },
        ];

        return (
            <DataBrowser<EditableAuthor>
                heights={{
                    header: 40,
                    row: 40,
                }}
                columns={columns}
                dataSource={this.props.authors}
                onClick={(author: EditableAuthor) => {
                    this.props.onEdit(author);
                }}
            />
        );
    }

    onUpdate(author: EditableAuthor) {
        this.props.onUpdate(author);
    }

    onCancel() {
        this.props.onCancelEdit();
    }

    renderAuthorEditor() {
        if (!this.props.selected) {
            return (
                <AlertMessage variant="info">
                    To edit an Author click the edit button{' '}
                    <Button size="sm" variant="secondary-outline" disabled>
                        <span className="fa fa-edit" />
                    </Button>
                    , to add a new Author, click the{' '}
                    <Button size="sm" variant="secondary-outline" disabled>
                        <span className="fa fa-plus" /> Add Author
                    </Button>{' '}
                    button..
                </AlertMessage>
            );
        }
        return (
            <AuthorForm
                author={this.props.selected}
                onUpdate={this.onUpdate.bind(this)}
                onCancel={this.onCancel.bind(this)}
                key={this.props.selected.id}
            />
        );
    }

    isCompletable() {
        return (
            this.props.authors.every((author) => {
                return (
                    author.firstName.isValid() &&
                    author.middleName.isValid() &&
                    author.lastName.isValid() &&
                    author.institutionField.isValid() &&
                    author.emailAddressField.isValid() &&
                    author.orcidIdField.isValid() &&
                    author.contributorType.isValid()
                );
            }) && this.props.authors.length > 0
        );
    }

    render() {
        return (
            <Stack>
                <Row>
                    <Col md={5}>
                        <Well variant="primary">
                            <Well.Header>Authors</Well.Header>
                            <Well.Body>{this.renderAuthors2()}</Well.Body>
                            <Well.Footer style={{ justifyContent: 'center' }}>
                                <Button variant="primary" onClick={this.props.onAdd}>
                                    <span className="fa fa-plus" /> Add Author
                                </Button>
                            </Well.Footer>
                        </Well>
                    </Col>
                    <Col md={7}>{this.renderAuthorEditor()}</Col>
                </Row>
                <Row className="g-0">
                    <Col md={12} className="mt-2">
                        <Row style={{ justifyContent: 'center' }} className="g-0">
                            <Button
                                variant="primary"
                                className="w-auto"
                                onClick={this.props.onDone}
                                disabled={!this.isCompletable()}
                            >
                                Done
                            </Button>
                        </Row>
                    </Col>
                </Row>
            </Stack>
        );
    }
}
