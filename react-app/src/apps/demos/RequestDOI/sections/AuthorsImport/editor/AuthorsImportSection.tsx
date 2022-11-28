import DataBrowser, { ColumnDef, optionalStringComparator } from "components/DataBrowser";
import Empty from "components/Empty";
import Well from "components/Well";
import { Component } from "react";
import { Button, Form } from "react-bootstrap";
import Avatar from "../../Authors/Avatar";
import { ImportableAuthor } from "./AuthorsImportSectionController";

export interface AuthorsImportSectionProps {
    authors: Array<ImportableAuthor>;
    selectedAuthors: Array<ImportableAuthor>;
    onChangeSelected: (selected: boolean, author: ImportableAuthor) => void;
    onDone: (authors: Array<ImportableAuthor>) => void;
}

interface AuthorsImportSectionState {

}

export default class AuthorsImportSection extends Component<AuthorsImportSectionProps, AuthorsImportSectionState> {
    constructor(props: AuthorsImportSectionProps) {
        super(props);
        this.state = {
            selectedAuthors: props.authors
        }
    }
    onChangeIncluded(included: boolean, changedAuthor: ImportableAuthor) {
        this.props.onChangeSelected(included, changedAuthor);
    }
    renderAuthors() {
        if (this.props.authors.length === 0) {
            return <Empty message="No users for this Narrative -- this should be impossible" />
        }
        const columns: Array<ColumnDef<ImportableAuthor>> = [
            {
                id: 'username',
                label: 'Username',
                style: {
                    flex: '1 1 0'
                },
                render: (row: ImportableAuthor) => {
                    return <span>
                        <Avatar userProfile={row.userProfile} style={{ width: '2em', marginRight: '0.5em', borderRadius: '1em' }} />
                        <a href={`/#user/${row.username}`} target="_blank">{row.username}</a>
                    </span>
                },
                sorter: (a: ImportableAuthor, b: ImportableAuthor) => {
                    return a.username.localeCompare(b.username);
                }
            },
            {
                id: 'firstName',
                label: 'First name',
                style: {
                    flex: '1.5 1 0'
                },
                render: (row: ImportableAuthor) => {
                    return <span>{row.firstName}</span>
                },
                sorter: (a: ImportableAuthor, b: ImportableAuthor) => {
                    return optionalStringComparator(a.firstName, b.firstName);
                }
            },
            {
                id: 'middleName',
                label: 'Middle name',
                style: {
                    flex: '1 1 0'
                },
                render: (row: ImportableAuthor) => {
                    return <span>{row.middleName}</span>
                }
            },
            {
                id: 'lastName',
                label: 'Last name',
                style: {
                    flex: '1.5 1 0'
                },
                render: (row: ImportableAuthor) => {
                    return <span>{row.lastName}</span>
                },
                sorter: (a: ImportableAuthor, b: ImportableAuthor) => {
                    return optionalStringComparator(a.lastName, b.lastName);
                }
            },
            {
                id: 'institution',
                label: 'Institution',
                style: {
                    flex: '3 1 0'
                },
                render: (row: ImportableAuthor) => {
                    return <span>{row.institution}</span>
                },
                sorter: (a: ImportableAuthor, b: ImportableAuthor) => {
                    return optionalStringComparator(a.institution, b.institution);
                }
            },
            {
                id: 'permission',
                label: 'Permission',
                style: {
                    flex: '0 0 6em'
                },
                render: (row: ImportableAuthor) => {
                    return <span>{row.permission}</span>
                },
                sorter: (a: ImportableAuthor, b: ImportableAuthor) => {
                    return a.permission.localeCompare(b.permission);
                }
            },
            {
                id: 'include',
                label: 'Include?',
                style: {
                    flex: '0 0 6em',
                    paddingLeft: '2em'
                },
                render: (row: ImportableAuthor) => {
                    return <Form.Check type="checkbox"
                        checked={this.props.selectedAuthors.includes(row)}
                        onChange={(e) => { this.onChangeIncluded(e.currentTarget.checked, row); }} />
                }
            }
        ]

        return <DataBrowser<ImportableAuthor>
            heights={{
                header: 40,
                row: 40
            }}
            columns={columns}
            dataSource={this.props.authors}
        />
    }

    render() {
        return <Well>
            <Well.Header>
                Import Shared Users
            </Well.Header>
            <Well.Body>
                <p>
                    Here you may import KBase users who have access to this Narrative. After importing any users, you'll be able edit, add, or remove authors in the "Authors" section below.
                </p>
                {this.renderAuthors()}
            </Well.Body>
            <Well.Footer style={{ justifyContent: 'center' }}>
                <Button variant="primary" className="w-auto" onClick={() => { this.props.onDone(this.props.selectedAuthors); }}>Import Selected Shared Users to Authors</Button>
            </Well.Footer>
        </Well>
    }
}
