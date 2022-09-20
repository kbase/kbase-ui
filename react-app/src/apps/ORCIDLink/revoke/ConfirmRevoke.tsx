import { Component } from "react";
import { Alert, Button, ButtonGroup, ButtonToolbar, Col, Row, Stack } from "react-bootstrap";
import { ORCIDLinkInfo } from "../Model";
import { RevokeState, RevokeStatus } from "./Controller";

export interface ConfirmRevokeProps {
    revokeState: RevokeState;
    revokeLink: () => void;
    cancel: () => void;
}

interface ConfirmRevokeState {

}

export default class ConfirmRevoke extends Component<ConfirmRevokeProps, ConfirmRevokeState> {

    renderNotLinked() {
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
        return <div className="well" style={{ maxWidth: '60em', margin: '0 auto' }}>
            <div className="well-header">
                Success!
            </div>
            <div className="well-body">
                The ORCID Link has been successfully removed.
            </div>
            <div className="well-footer" style={{ justifyContent: 'center' }}>
                <Button variant="primary" onClick={this.props.cancel}>
                    <span className="fa fa-mail-reply" /> Done
                </Button>
            </div>

        </div>
    }

    renderLinked() {
        return <Stack>
            <Row>
                <Col>
                    <div className="well">
                        <div className="well-header">
                            Confirm Removal of ORCID Link
                        </div>
                        <div className="well-body">
                            <p>
                                Sure you want to revoke this ORCID Link?
                            </p>
                        </div>
                        <div className="well-footer" style={{ justifyContent: 'center' }}>
                            <Button variant="danger" className="me-2" onClick={this.props.revokeLink}>
                                <span className="fa fa-lg fa-trash" /> Revoke ORCID® Link
                            </Button>


                            <Button variant="primary" onClick={this.props.cancel}>
                                <span className="fa fa-lg fa-ban" /> Cancel
                            </Button>
                        </div>
                    </div>
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