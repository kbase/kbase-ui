import { pluralize } from "components/common";
import DataBrowser, { Columns, optionalStringComparator } from "components/DataBrowser";
import { Component } from "react";
import { Accordion, Col, Row, Stack } from "react-bootstrap";
import { Author } from "../../../DOIRequestClient";

export interface AuthorsViewProps {
    authors: Array<Author>;
}

interface AuthorsViewState {
}

export default class AuthorsView extends Component<AuthorsViewProps, AuthorsViewState> {
    constructor(props: AuthorsViewProps) {
        super(props);
        this.state = {
        }
    }

    renderAuthors2() {

        const columns: Columns<Author> = [
            {
                id: 'firstName',
                label: 'First name',
                render(author: Author) {
                    return author.firstName;
                },
                sorter: (a: Author, b: Author) => {
                    return a.firstName.localeCompare(b.firstName);
                }
            },
            {
                id: 'middleName',
                label: 'Middle name',
                render(author: Author) {
                    return author.middleName;
                }
            },
            {
                id: 'lastName',
                label: 'Last name',
                render(author: Author) {
                    return author.lastName;
                },
                sorter: (a: Author, b: Author) => {
                    return a.lastName.localeCompare(b.lastName);
                }
            },
            {
                id: 'institution',
                label: 'Institution',
                render(author: Author) {
                    return author.institution;
                },
                sorter: (a: Author, b: Author) => {
                    return optionalStringComparator(a.institution, b.institution)
                }
            },
            {
                id: 'email',
                label: 'E-Mail',
                render(author: Author) {
                    return author.emailAddress;
                }
            },
            {
                id: 'orcidId',
                label: 'ORCID Id',
                render(author: Author) {
                    return author.orcidId;
                }
            },
            {
                id: 'contributorType',
                label: 'Role',
                render(author: Author) {
                    return author.contributorType;
                },
                sorter: (a: Author, b: Author) => {
                    return a.contributorType.localeCompare(b.contributorType);
                }
            },
        ]

        return <DataBrowser
            columns={columns}
            dataSource={this.props.authors}
            heights={{
                header: 40,
                row: 40
            }}
        />
    }

    render() {
        return <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>
                    {pluralize(this.props.authors.length, 'author')}
                </Accordion.Header>
                <Accordion.Body>
                    <Stack>
                        <Row>
                            <Col md={12}>
                                {this.renderAuthors2()}
                            </Col>
                        </Row>
                    </Stack>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }

}