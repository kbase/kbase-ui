import Loading from "components/Loading";
import { SimpleError } from "components/MainWindow";
import Well from "components/Well";
import { AsyncProcessStatus } from "lib/AsyncProcess";
import { Component } from "react";
import { Button, ButtonToolbar, Col, Row, Stack } from "react-bootstrap";
import { LinkState, RevokeState, RevokeStatus } from "./Controller";
import Revoker from "./Revoker";

export interface ViewProps {
    linkState: LinkState;
    revokeState: RevokeState;
    revokeLink: () => void;
    cancel: () => void;
    setTitle: (title: string) => void;
}

interface ViewState {
}

export default class View extends Component<ViewProps, ViewState> {
    componentDidMount() {
        this.setTitleFromProps();
    }

    componentDidUpdate(): void {
        this.setTitleFromProps();
    }

    setTitleFromProps() {
        switch (this.props.linkState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                this.props.setTitle('KBase ORCID® Link - Revoke - Loading...');
                break;
            case AsyncProcessStatus.ERROR:
                if (this.props.revokeState.status === RevokeStatus.REVOKED) {
                    this.props.setTitle('KBaseORCID® Link - Revoke - Successfully Revoked');
                } else {
                    this.props.setTitle('KBaseORCID® Link - Revoke - Error');
                }
                break;
            case AsyncProcessStatus.SUCCESS:
                if (this.props.revokeState.status === RevokeStatus.REVOKED) {
                    // TODO: this is a falacy - when revoked, there will no longer be
                    // a link, so we should technically be in an ERROR state.
                    // But we should just change the link status to be:
                    // NONE, PENDING, LINKED, NOTLINKED, ERROR
                    this.props.setTitle('KBase ORCID® Link - Successfully Removed');
                } else {
                    this.props.setTitle('KBaseORCID® Link - Confirm Link Removal');
                }
                break;
        }
    }

    // renderNotLinked() {
    //     this.props.setTitle('KBase ORCID® Link - Revoke - Not Linked')
    //     return <div className="well" style={{ maxWidth: '60em', margin: '0 auto' }}>
    //         <div className="well-header">
    //             Warning: Not Linked
    //         </div>
    //         <div className="well-body">
    //             This account is not currently linked to an ORCID Account.
    //         </div>
    //         <div className="well-footer" style={{ justifyContent: 'center' }}>
    //             <Button variant="primary" onClick={this.props.cancel}>
    //                 <span className="fa fa-mail-reply" /> Done
    //             </Button>
    //         </div>

    //     </div>
    // }

    // renderRevoked() {
    //     this.props.setTitle('KBase ORCID® Link - Revoke - Successfully Revoked Link')
    //     return <Well variant="success" style={{ maxWidth: '60em', margin: '0 auto' }}>
    //         <Well.Header>
    //             Success!
    //         </Well.Header>
    //         <Well.Body>
    //             <p>
    //                 The ORCID Link has been successfully removed.
    //             </p>
    //         </Well.Body>
    //         <Well.Footer style={{ justifyContent: 'center' }}>
    //             <ButtonToolbar>
    //                 <Button variant="primary" onClick={this.props.cancel}>
    //                     <span className="fa fa-mail-reply" /> Done
    //                 </Button>
    //             </ButtonToolbar>
    //         </Well.Footer>
    //     </Well>
    // }

    renderAbout() {
        return <Well variant="info">
            <Well.Header icon="sticky-note-o">
                Note
            </Well.Header>
            <Well.Body>
                <p>
                    Here you may revoke, or remove, your KBase ORCID® Link.
                </p>
                <ul>
                    <li>This <b>will</b> prevent KBase from accessing your ORCID® account in any way.</li>
                    <li>This <b>will not</b> affect your ability to sign in via ORCID®.</li>
                    <li>If you have opted to show your ORCID® iD in your profile, it will no longer be shown.</li>
                </ul>
            </Well.Body>
        </Well>;
    }

    renderLoading() {
        return <Loading />
    }

    renderError(error: SimpleError) {
        return <Well variant="danger">
            <Well.Header>
                Error
            </Well.Header>
            <Well.Body>
                <p>
                    {error.message}
                </p>
            </Well.Body>
            <Well.Footer style={{ justifyContent: 'center' }}>
                <ButtonToolbar>
                    <Button variant="primary" onClick={this.props.cancel}>
                        <span className="fa fa-lg fa-mail-reply" />  Return to KBase ORCID® Link home
                    </Button>
                </ButtonToolbar>
            </Well.Footer>
        </Well>;
    }

    renderRevoked() {
        return <Well variant="success" style={{ maxWidth: '60em', margin: '0 auto' }}>
            <Well.Header>
                Success!
            </Well.Header>
            <Well.Body>
                <p>
                    The KBase ORCID® Link has been successfully removed.
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

    renderState() {
        switch (this.props.linkState.status) {
            case AsyncProcessStatus.NONE:
            case AsyncProcessStatus.PENDING:
                return this.renderLoading();
            case AsyncProcessStatus.ERROR:
                if (this.props.revokeState.status === RevokeStatus.REVOKED) {
                    return this.renderRevoked();
                } else {
                    return this.renderError(this.props.linkState.error);
                }

            case AsyncProcessStatus.SUCCESS:
                return <Revoker
                    revokeState={this.props.revokeState}
                    revokeLink={this.props.revokeLink}
                    cancel={this.props.cancel}
                />
        }
    }

    render() {
        return <Stack>
            <Row>
                <Col>
                    {this.renderState()}
                </Col>
                <Col>
                    {this.renderAbout()}
                </Col>
            </Row>
        </Stack>
    }
}
