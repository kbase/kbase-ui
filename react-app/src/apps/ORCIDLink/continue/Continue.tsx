import { Component } from 'react';
import { ReturnLink, LinkingSessionInfo } from '../Model';
import { renderORCIDIcon, renderScope } from '../common';
import { Alert, Button, Col, Row, Stack } from 'react-bootstrap';
import styles from './Continue.module.css';
import AlertMessage from 'components/AlertMessage';
import { ORCID_URL } from '../constants';
import Well from 'components/Well';

export interface ContinueProps {
    linkingSessionInfo: LinkingSessionInfo;
    returnLink?: ReturnLink;
    confirmLink: () => Promise<void>;
    cancelLink: () => Promise<void>;
}

export default class Continue extends Component<ContinueProps> {
    renderORCIDUserRecord() {
        const { orcid_auth: { orcid, scope }, created_at, expires_at } = this.props.linkingSessionInfo;
        return <Well style={{ marginBottom: '1em' }}>
            <Well.Body>
                <div className="flex-table">
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            ORCID® Account ID
                        </div>
                        <div className="flex-col -col2">
                            <div className="flex-row" style={{ alignItems: 'center' }}>
                                <a href={`${ORCID_URL}/${orcid}`} target="_blank">
                                    {renderORCIDIcon()}
                                    {orcid}
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Name on Account
                        </div>
                        <div className="flex-col">
                            {this.props.linkingSessionInfo.orcid_auth.name}
                        </div>
                    </div>
                </div>
            </Well.Body>
        </Well>
    }

    renderRequestedScopes() {
        const { orcid_auth: { orcid, scope }, created_at, expires_at } = this.props.linkingSessionInfo;
        return <Well style={{ marginBottom: '1em' }}>
            <Well.Body>
                <div className="flex-table">
                    <div className="flex-row">
                        <div className={`flex-col`} style={{ flex: '0 0 5em' }}>
                            Scopes
                        </div>
                        <div className={`flex-col`}>
                            {renderScope(scope)}
                        </div>
                    </div>
                </div>
            </Well.Body>
        </Well>
    }

    renderReturnURL() {
        if (!this.props.returnLink) {
            return;
        }
        return <AlertMessage type="info" style={{ marginTop: '1em' }} title="After Linking...">
            After creating the link, your browser will be returned to <b>{this.props.returnLink.label}</b>.
        </AlertMessage>;
    }

    renderConfirmDialog() {
        return <Well variant="primary">
            <Well.Header>
                Confirm Link to ORCID®
            </Well.Header>
            <Well.Body>
                <p>
                    By linking the ORCID® account above you will be granting KBase the ability to interact with
                    that account on your behalf. You may revoke this at any time.
                </p>
                {this.renderReturnURL()}
            </Well.Body>
            <Well.Footer>
                <Stack direction="horizontal" gap={3} className="justify-content-center" style={{ flex: '1 1 0' }}>
                    <Button variant="primary" onClick={this.props.confirmLink}>
                        <span className="fa fa-lg fa-plus" /> Create ORCID® Link
                    </Button>
                    <Button variant="danger" onClick={this.props.cancelLink}>
                        <span className="fa fa-lg fa-mail-reply" /> Cancel
                    </Button>
                </Stack>
            </Well.Footer>
        </Well>
    }

    renderInfo() {
        return <div>
            <h4>ORCID® Account</h4>

            <p>The following ORCID® account will be linked to this KBase account.</p>

            <p>You may follow the <b>ORCID® Account ID</b> link below to inspect additional information about the account.</p>

            {this.renderORCIDUserRecord()}

            <h4 style={{ marginTop: '1em' }}>Scopes being granted to KBase</h4>

            <p>KBase is requesting the "scopes" below to view or manipulate your account on your behalf. A scope is a set
                of permissions to access your ORCID® account.
            </p>

            <p>Note that that interaction with your ORCID® account will only be conducted while you are logged in,
                and in response to direct actions you take.
            </p>

            {this.renderRequestedScopes()}
        </div>
    }

    render() {
        return <Stack>
            <Row>
                <Col>
                    {this.renderConfirmDialog()}
                </Col>
                <Col>
                    {this.renderInfo()}
                </Col>
            </Row>
        </Stack>
    }
}
