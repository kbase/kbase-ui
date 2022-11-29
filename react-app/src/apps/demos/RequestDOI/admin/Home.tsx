import Empty from 'components/Empty';
import { Component } from 'react';
import { Button, ButtonGroup, Col, Row, Stack } from 'react-bootstrap';
import { AdminGetDOIRequestsResult, DOIForm, StepStatus } from "../DOIRequestClient";
import { na } from '../utils';

export interface DOIRequestAdminProps {
    // createForm: () => void;
    deleteForm: (formId: string) => void;
    editForm: (formId: string) => void;
    doiForms: Array<DOIForm>;
    requests: Array<AdminGetDOIRequestsResult>
}

interface DOIRequestAdminState {

}

export default class DOIRequestAdmin extends Component<DOIRequestAdminProps, DOIRequestAdminState> {
    renderIntro() {
        return <div>
            <h2>Admin</h2>
            <p>
                <Button variant="secondary" href="/#demos"><span className="fa fa-mail-reply" /> Back</Button>
            </p>
            <p>
                This is a simple admin interface to DOI Forms and Requests
            </p>
        </div>
    }

    renderFormsList() {
        if (this.props.doiForms.length === 0) {
            return <Empty message="No existing DOI Applications" />
        }
        const rows = this.props.doiForms.map((form, index) => {
            return <tr key={index}>
                <td><Button
                    variant="link"
                    onClick={() => { this.props.editForm(form.form_id); }}>{form.form_id}</Button>
                </td>
                <td>{Intl.DateTimeFormat('en-US', {}).format(form.created_at)}</td>
                <td>{Intl.DateTimeFormat('en-US', {}).format(form.updated_at)}</td>
                <td>{form.status}</td>
                <td>{form.sections.reviewAndSubmit.status === StepStatus.COMPLETE ? form.sections.reviewAndSubmit.value.requestId : na()} </td>
                <td>
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            onClick={() => { this.props.editForm(form.form_id); }}>
                            <span className="fa fa-edit" />
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => { this.props.deleteForm(form.form_id); }}>
                            <span className="fa fa-trash" />
                        </Button>
                    </ButtonGroup>
                </td>
            </tr>
        });
        return <Stack>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Created</th>
                        <th>Updated</th>
                        <th>Status</th>
                        <th>Request Id</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table >
        </Stack>
    }

    renderRequestsList() {
        if (this.props.requests.length === 0) {
            return <Empty message="No DOI Requests" />
        }
        const rows = this.props.requests.map((request, index) => {
            return <tr key={index}>
                <td><a href={`#/demos/doi/admin/request/${request.request_id}`} target="_blank">{request.request_id}</a></td>
                <td>{request.response.response.record.doi}</td>
                <td>{Intl.DateTimeFormat('en-US', {}).format(new Date(request.response.at))}</td>
                {/* <td>{Intl.DateTimeFormat('en-US', {}).format(form.updated_at)}</td> */}
                <td>{request.response.response.record.status}</td>
                <td>{request.response.response.record.doi_status}</td>
                <td>
                    {/* <ButtonGroup>
                        <Button
                            variant="primary"
                            onClick={() => { this.props.editForm(form.form_id); }}>
                            <span className="fa fa-edit" />
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => { this.props.deleteForm(form.form_id); }}>
                            <span className="fa fa-trash" />
                        </Button>
                    </ButtonGroup> */}
                </td>
            </tr>
        });
        return <Stack>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>DOI</th>
                        <th>Created</th>
                        <th>Request Status</th>
                        <th>DOI Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </table >
        </Stack>
    }

    // renderFormList() {
    //     return <div style={{ marginTop: '2em' }}>
    //         <h3>
    //             Existing Forms
    //         </h3>

    //         {this.renderForms()}
    //     </div>
    // }

    renderAdmin() {
        return <div style={{ marginTop: '2em' }}>
            <h3>
                Admin
            </h3>

            <p>
                <Button variant="secondary" href="/#demos"><span className="fa fa-mail-reply" /> Back</Button>
            </p>

            <h4>Forms</h4>

            {this.renderFormsList()}

            <h4>Requests</h4>

            {this.renderRequestsList()}
        </div>
    }

    render() {
        return <Stack>
            {/* <Row>
                <Col>
                    {this.renderIntro()}
                </Col>
                <Col>
                    {this.renderFormCreate()}
                    {this.renderFormList()}
                </Col>
            </Row> */}
            <Row>
                <Col>
                    {this.renderAdmin()}
                </Col>
            </Row>
        </Stack>
    }
}
