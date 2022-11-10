import AlertMessage from "components/AlertMessage";
import DataBrowser, { ColumnDef, optionalStringComparator } from "components/DataBrowser";
import FlexGrid from "components/FlexGrid";
import { Component } from "react";
import { Button, Col, Form, Row, Stack } from "react-bootstrap";
import { ImportableAuthor } from "./AuthorsImportSectionController";
// import AuthorForm from "./AuthorFormController";
// import { EditableAuthor } from "./AuthorsImportSectionController";

export interface AuthorsImportSectionProps {
    authors: Array<ImportableAuthor>;
    onDone: () => void;
}

interface AuthorsImportSectionState {
}

export default class AuthorsImportSection extends Component<AuthorsImportSectionProps, AuthorsImportSectionState> {
    renderAuthors() {
        // const citations = this.state.citations;
        // if (citations.length === 0) {
        //     return <Empty message="No citations" />
        // }
        if (this.props.authors.length === 0) {
            return <AlertMessage type="warning">
                You must provide one or more authors, one of which must be the primary author.
            </AlertMessage>
        }
        const rows = this.props.authors.map((author, index) => {
            // const buttons = <ButtonGroup>
            //     <Button variant="outline-primary" onClick={() => { this.props.onEdit(author) }}>
            //         <span className="fa fa-edit" />
            //     </Button>
            //     <Button variant="outline-danger">
            //         <span className="fa fa-trash" />
            //     </Button>
            // </ButtonGroup>;
            const controls = <div>
                <Form.Check type="checkbox" />
            </div>
            return <FlexGrid.Row key={index} style={{ borderBottom: '1px solid rgba(200, 200, 200, 0.5)', padding: '0.5em 0' }}>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.username}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1.5 1 0' }}>{author.firstName}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.middleName}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1.5 1 0' }}>{author.lastName}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '3 1 0' }}>{author.institution}</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.permission}</FlexGrid.Col>
                {/* <FlexGrid.Col style={{ flex: '1 1 0' }}>{author.orcidId}</FlexGrid.Col> */}
                <FlexGrid.Col style={{ flex: '0 0 4em' }}>{controls}</FlexGrid.Col>
            </FlexGrid.Row>
        });
        return <FlexGrid>
            <FlexGrid.Row style={{ borderBottom: '1px dashed rgb(200, 200, 200)' }}>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>Username</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1.5 1 0' }}>First</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>Middle</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1.5 1 0' }}>Last</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '3 1 0' }}>Institution</FlexGrid.Col>
                <FlexGrid.Col style={{ flex: '1 1 0' }}>Permission</FlexGrid.Col>
                {/* <FlexGrid.Col style={{ flex: '1 1 0' }}>ORCID Id</FlexGrid.Col> */}
                <FlexGrid.Col style={{ flex: '0 0 4em' }}>Include?</FlexGrid.Col>
            </FlexGrid.Row>
            {rows}
        </FlexGrid>;
    }

    renderAuthors2() {
        // const citations = this.state.citations;
        // if (citations.length === 0) {
        //     return <Empty message="No citations" />
        // }
        if (this.props.authors.length === 0) {
            return <AlertMessage type="warning">
                You must provide one or more authors, one of which must be the primary author.
            </AlertMessage>
        }
        const columns: Array<ColumnDef<ImportableAuthor>> = [
            {
                id: 'username',
                label: 'Username',
                style: {
                    flex: '1 1 0'
                },
                render: (row: ImportableAuthor) => {
                    return <span>{row.username}</span>
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
                    return <Form.Check type="checkbox" />
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
        return <Stack>
            <Row>
                <Col md={12}>
                    {this.renderAuthors2()}
                </Col>
            </Row>
            <Row className="g-0">
                <Col md={12}>
                    <Row style={{ justifyContent: 'center' }} className="g-0">
                        <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Next <span className="fa fa-hand-o-down" /></Button>
                    </Row>
                </Col>
            </Row>
        </Stack>
    }
}
