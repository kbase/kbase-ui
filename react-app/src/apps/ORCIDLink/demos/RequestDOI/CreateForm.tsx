import { Component } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';

export interface CreateFormProps {
    createForm: () => void;
}

interface CreateFormState {

}

export default class CreateForm extends Component<CreateFormProps, CreateFormState> {
    renderIntro() {
        return <div>
            <h2>Request DOI</h2>
            <p>
                <Button variant="secondary" href="/#orcidlink/demos"><span className="fa fa-mail-reply" /> Back</Button>
            </p>
            <p>
                A DOI request form may be saved in an intermediate state, allowing a user to complete it in steps.
            </p>
            <p>
                This demo shows several features required for this form:
            </p>
            <ul>
                <li>
                    Select a narrative as the subject of the DOI
                </li>
                <li>
                    Extract citations from the Narrative markdown cells and apps.
                </li>
                <li>
                    Pre-fill personal information via ORCID Link
                </li>
                <li>
                    Create an ORCID Link while using the form
                </li>
            </ul>
            <h3>TODO</h3>
            <ul>
                <li>
                    Edit any step of the form
                </li>
                <li>
                    Save in format compatible with Zach's script
                </li>
                <li>
                    Show list of forms that can be resumed (helpful for development)
                </li>
            </ul>
        </div>
    }

    renderFormCreate() {
        return <div className="well">
            <div className="well-header">
                Create DOI Form with import from ORCID, Narrative
            </div>
            <div className="well-body">
                <p>
                    DOI Forms are stored in a database. Each form has a unique id, which allows
                    saving and resumption of the form which is required for ORCID Linking to be
                    conducted in the midst of filling out the form.
                </p>
                <p>
                    The button below creates a new form, with a unique id. It represents what could be any
                    user-initiated action.
                </p>
            </div>
            <div className="well-footer">
                <Button variant="primary" onClick={this.props.createForm} >
                    <span className="fa fa-plus" /> Create New Form
                </Button>
            </div>
        </div>
    }

    renderForms() {
        return <div>
            <em>TODO</em>
        </div>
    }

    renderFormList() {
        return <div style={{ marginTop: '2em' }}>
            <h3>
                Existing Forms
            </h3>
            <p>
                You may resume a form by selecting one below:
            </p>
            {this.renderForms()}
        </div>
    }

    render() {
        return <Stack>
            <Row>
                <Col>
                    {this.renderIntro()}
                </Col>
                <Col>
                    {this.renderFormCreate()}
                    {this.renderFormList()}
                </Col>
            </Row>
        </Stack>
    }
}
