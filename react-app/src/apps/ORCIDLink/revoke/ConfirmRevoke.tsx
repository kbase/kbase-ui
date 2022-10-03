import Well from "components/Well";
import { Component } from "react";
import { Button, ButtonGroup, ButtonToolbar, Col, Row, Stack } from "react-bootstrap";
import { RevokeState, RevokeStatus } from "./Controller";

export interface ConfirmRevokeProps {
    revokeState: RevokeState;
    revokeLink: () => void;
    cancel: () => void;
    setTitle: (title: string) => void;
}

interface ConfirmRevokeState {

}

export default class ConfirmRevoke extends Component<ConfirmRevokeProps, ConfirmRevokeState> {

    renderNotLinked() {
        this.props.setTitle('ORCID® Link - Revoke - Not Linked')
        return <div className="well" style={{ maxWidth: '60em', margin: '0 auto' }}>
            <div className="well-header">
                Warning: Not Linked
            </div>
            <div className="well-body">
                This account is not currently linked to an ORCID Account.
            </div>
            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="primary" onClick={this.props.cancel}>
                    <span className="fa fa-mail-reply" /> Done
                </Button>
            </div>

        </div>
    }

    renderRevoked() {
        this.props.setTitle('ORCID® Link - Revoke - Successfully Revoked Link')
        // return <div className="well" style={{ maxWidth: '60em', margin: '0 auto' }}>
        //     <div className="well-header">
        //         Success!
        //     </div>
        //     <div className="well-body">
        //         The ORCID Link has been successfully removed.
        //     </div>
        //     <div className="well-footer" style={{ justifyContent: 'center' }}>
        //         <Button variant="primary" onClick={this.props.cancel}>
        //             <span className="fa fa-mail-reply" /> Done
        //         </Button>
        //     </div>

        // </div>

        return <Well variant="success" style={{ maxWidth: '60em', margin: '0 auto' }}>
            <Well.Header>
                Success!
            </Well.Header>
            <Well.Body>
                <p>
                    The ORCID Link has been successfully removed.
                </p>
            </Well.Body>
            <Well.Footer style={{ justifyContent: 'center' }}>
                <ButtonToolbar>
                    <Button variant="primary" onClick={this.props.cancel}>
                        <span className="fa fa-mail-reply" /> Done
                    </Button>
                </ButtonToolbar>
            </Well.Footer>
        </Well>
    }

    renderLinked() {
        this.props.setTitle('ORCID® Link - Revoke - Confirm Link Revocation')
        return <Stack>
            <Row>
                <Col>
                    <Well variant="danger">
                        <Well.Header>
                            Confirm Removal of ORCID Link
                        </Well.Header>
                        <Well.Body>
                            <p>
                                Sure you want to revoke this ORCID Link?
                            </p>
                        </Well.Body>
                        <Well.Footer style={{ justifyContent: 'center' }}>
                            <ButtonToolbar>
                                <Button variant="danger" className="me-2" onClick={this.props.revokeLink}>
                                    <span className="fa fa-lg fa-trash" /> Revoke ORCID® Link
                                </Button>

                                <Button variant="primary" onClick={this.props.cancel}>
                                    <span className="fa fa-lg fa-ban" /> Cancel
                                </Button>
                            </ButtonToolbar>
                        </Well.Footer>
                    </Well>
                </Col>
                <Col>
                    <h3>
                        About
                    </h3>

                    <p>
                        Here you may revoke, or remove, your ORCID Link.
                    </p>
                    <p>
                        This will prevent KBase from accessing your ORCID account in any way.
                    </p>
                    <p>
                        This will not affect your ability to sign in via ORCID.
                    </p>
                    <p>
                        This will NOT affect any data you have imported from ORCID.
                    </p>

                    <blockquote>
                        Need to determine and explain how this affects any work records created by KBase.
                    </blockquote>
                </Col>
            </Row>
        </Stack>

    }

    render() {
        switch (this.props.revokeState.status) {
            case RevokeStatus.LINKED:
                return this.renderLinked();
            case RevokeStatus.NOT_LINKED:
                return this.renderNotLinked();
            case RevokeStatus.REVOKED:
                return this.renderRevoked();
        }

    }
}