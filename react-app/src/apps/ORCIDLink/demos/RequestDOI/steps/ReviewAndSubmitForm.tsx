import { OSTIAuthor, OSTIRelatedIdentifier, OSTISubmission } from "apps/ORCIDLink/ORCIDLinkClient";
import PropTable from "components/PropTable";
import { Component } from "react";
import { Button, Row, Stack, Table } from "react-bootstrap";
import styles from './ReviewAndSubmitForm.module.css';

export interface ReviewAndSubmitFormProps {
    submission: OSTISubmission;
    onDone: () => void;
}

interface ReviewAndSubmitFormState {
}

export default class ReviewAndSubmitForm extends Component<ReviewAndSubmitFormProps, ReviewAndSubmitFormState>{
    renderAuthors(authors: Array<OSTIAuthor>) {
        const rows = authors.map(({ first_name, middle_name, last_name, private_email, affiliation_name, orcid_id, contributor_type }) => {
            return <tr>
                <td>
                    {first_name}
                </td>
                <td>
                    {middle_name}
                </td>
                <td>
                    {last_name}
                </td>
                <td>
                    {private_email}
                </td>
                <td>
                    {affiliation_name}
                </td>
                <td>
                    {orcid_id}
                </td>
                <td>
                    {contributor_type}
                </td>
            </tr>
        });

        return <Table className={styles.subdued}>
            <thead>
                <tr>
                    <th colSpan={3}>Name</th>
                    <th>Affiliation</th>
                    <th>Email</th>
                    <th>ORCID Id</th>
                    <th>Contributor type</th>
                </tr>
                <tr>
                    <th>First</th>
                    <th>Middle</th>
                    <th>Last</th>
                    <th colSpan={4}></th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }

    renderRelatedIdentifiers(identifiers: Array<OSTIRelatedIdentifier> | undefined) {
        if (typeof identifiers === 'undefined') {
            return 'none';
        }

        const rows = identifiers.map(({ related_identifier, relation_type, related_identifier_type }) => {
            return <tr>
                <td>{related_identifier}</td>
                <td>{relation_type}</td>
                <td>{related_identifier_type}</td>
            </tr>
        });

        return <Table>
            <thead>
                <tr>
                    <th>Related Identifier</th>
                    <th>Type</th>
                    <th>Identifier Type</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    }

    renderSubmissionForm() {
        return <PropTable
            rows={[
                ['Title', this.props.submission.title],
                ['Publication Date', this.props.submission.publication_date],
                ['Authors', this.renderAuthors(this.props.submission.authors)],
                ['Site URL', this.props.submission.site_url],
                ['Dataset Type', this.props.submission.dataset_type],
                ['Keywords', this.props.submission.keywords],
                ['Description', this.props.submission.description],
                ['Accession Number', this.props.submission.accession_num],
                ['Related Identifiers', this.renderRelatedIdentifiers(this.props.submission.related_identifiers)],
            ]}
            styles={{
                col1: {
                    flex: '0 0 11em'
                },
                col2: {
                    justifyContent: 'flex-start'
                },
            }}
        />
    }
    render() {
        return <Stack gap={2} style={{ marginBottom: '1em' }
        } >
            <div>
                <p>
                    Please review the information collected below.
                </p>
                <p>
                    Then click the Send button to submit the request.
                </p>
            </div>

            {this.renderSubmissionForm()}
            <Row style={{ justifyContent: 'center' }} className="g-0">
                <Button variant="primary" className="w-auto" onClick={this.props.onDone}>Send <span className="fa fa-paper-plane" /></Button>
            </Row>
        </Stack >;
    }
}
