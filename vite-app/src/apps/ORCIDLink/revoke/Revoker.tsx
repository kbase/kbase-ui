import Loading from "components/Loading";
import Well from "components/Well";
import { Component } from "react";
import { Button, ButtonToolbar } from "react-bootstrap";
import { ORCIDLinkInfo } from "../lib/Model";
import { RevokeState, RevokeStatus } from "./Controller";

export interface RevokerProps {
    revokeState: RevokeState;
    revokeLink: () => void;
    cancel: () => void;
}


export default class View extends Component<RevokerProps> {
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

    renderRevoking() {
        return <Well variant="info" style={{ maxWidth: '60em', margin: '0 auto' }}>
            <Well.Header>
                Removing...
            </Well.Header>
            <Well.Body>
                <Loading message="Pulling all the strings I can" />
            </Well.Body>
        </Well>
    }

    renderLoading() {
        return <Well variant="info" style={{ maxWidth: '60em', margin: '0 auto' }}>
            <Well.Header>
                Loading...
            </Well.Header>
            <Well.Body>
                <Loading />
            </Well.Body>
        </Well>
    }

    renderLinked(linkInfo: ORCIDLinkInfo) {
        return <Well variant="danger">
            <Well.Header>
                Confirm Removal of KBase ORCID® Link
            </Well.Header>
            <Well.Body>
                <p>
                    Ara you sure you want to remove this KBase ORCID® Link?
                </p>
                <p>
                    ORCID® iD is <b>{linkInfo.orcidID}</b> for <b>{linkInfo.realname}</b>
                </p>
            </Well.Body>
            <Well.Footer style={{ justifyContent: 'center' }}>
                <ButtonToolbar>
                    <Button variant="danger" className="me-2" onClick={this.props.revokeLink}>
                        <span className="fa fa-lg fa-trash" /> Remove KBase ORCID® Link
                    </Button>

                    <Button variant="primary" onClick={this.props.cancel}>
                        <span className="fa fa-lg fa-mail-reply" />  Cancel
                    </Button>
                </ButtonToolbar>
            </Well.Footer>
        </Well>
    }

    renderError(message: string) {
        return <Well variant="danger">
            <Well.Header>
                Error
            </Well.Header>
            <Well.Body>
                <p>
                    {message}
                </p>
            </Well.Body>
            <Well.Footer style={{ justifyContent: 'center' }}>
                <ButtonToolbar>
                    <Button variant="primary" onClick={this.props.cancel}>
                        <span className="fa fa-lg fa-mail-reply" />  Cancel
                    </Button>
                </ButtonToolbar>
            </Well.Footer>
        </Well>
    }

    render() {
        switch (this.props.revokeState.status) {
            case RevokeStatus.NONE:
                return this.renderLoading()
            case RevokeStatus.LINKED:
                return this.renderLinked(this.props.revokeState.linkInfo)
            case RevokeStatus.REVOKING:
                return this.renderRevoking();
            case RevokeStatus.REVOKED:
                return this.renderRevoked();
            case RevokeStatus.ERROR:
                return this.renderError(this.props.revokeState.message)
        }
    }
}
