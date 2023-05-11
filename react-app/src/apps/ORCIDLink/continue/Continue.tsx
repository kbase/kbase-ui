import AlertMessage from 'components/AlertMessage';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { renderORCIDIcon, renderScope } from '../common';
import { LinkingSessionComplete } from '../lib/Model';
import { ReturnInstruction } from '../lib/ORCIDLinkClient';
import { ORCID_URL } from '../lib/constants';
import styles from './Continue.module.css';

export interface ContinueProps {
    linkingSession: LinkingSessionComplete;
    returnInstruction?: ReturnInstruction;
    confirmLink: () => Promise<void>;
    cancelLink: () => Promise<void>;
}

export default class Continue extends Component<ContinueProps> {
    renderORCIDUserRecord() {
        const {
            orcid_auth: { orcid }
        } = this.props.linkingSession;
        return (
            <Well style={{ marginBottom: '1em' }} variant="primary">
                <Well.Body>
                    <div className="flex-table">
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>ORCID® Account ID</div>
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
                            <div className={`flex-col ${styles['-col1']}`}>Name on Account</div>
                            <div className="flex-col">
                                {this.props.linkingSession.orcid_auth.name}
                            </div>
                        </div>
                    </div>
                </Well.Body>
            </Well>
        );
    }

    renderRequestedScopes() {
        const {
            orcid_auth: { orcid, scope },
            created_at,
            expires_at,
        } = this.props.linkingSession;
        return renderScope(scope);
    }

    renderReturnInstruction() {
        const returnInstruction = this.props.returnInstruction;
        if (typeof returnInstruction === 'undefined') {
            return;
        }
        switch (returnInstruction.type) {
            case 'link':
                return (
                    <AlertMessage variant="info" style={{ marginTop: '1em' }} title="After Linking...">
                        After creating the link, your browser will be returned to{' '}
                        <b>{returnInstruction.label}</b>.
                    </AlertMessage>
                );
            case 'window':
                return (
                    <AlertMessage variant="info" style={{ marginTop: '1em' }} title="After Linking...">
                        After creating the link, this window will be closed, and you should be returned to{' '}
                        <b>{returnInstruction.label}</b>.
                    </AlertMessage>
                );
        }
    }

    renderConfirmDialog() {
        return (
            <Well variant="primary">
                <Well.Header>Confirm Link to ORCID®</Well.Header>
                <Well.Body>
                    <p>
                        By linking the ORCID® account above you will be granting KBase the ability
                        to interact with that account on your behalf. You may revoke this at any
                        time.
                    </p>
                    {this.renderReturnInstruction()}
                </Well.Body>
                <Well.Footer>
                    <Stack
                        direction="horizontal"
                        gap={3}
                        className="justify-content-center"
                        style={{ flex: '1 1 0' }}
                    >
                        <Button variant="primary" onClick={this.props.confirmLink}>
                            <span className="fa fa-lg fa-plus" /> Create ORCID® Link
                        </Button>
                        <Button variant="danger" onClick={this.props.cancelLink}>
                            <span className="fa fa-lg fa-mail-reply" /> Cancel
                        </Button>
                    </Stack>
                </Well.Footer>
            </Well>
        );
    }

    renderAccountInfo() {
        return (
            <div className={styles.section}>
                <h4>Your ORCID® Account</h4>

                <p>The following ORCID® account will be linked to this KBase account.</p>

                <p>
                    You may follow the <b>ORCID® Account ID</b> link below to inspect additional
                    information about the account.
                </p>

                {this.renderORCIDUserRecord()}
            </div>
        );
    }

    renderScopeInfo() {
        return (
            <div className={styles.section}>
                <h4>Scopes being granted to KBase</h4>

                <p>
                    KBase is requesting the "scopes" below to view or manipulate your ORCID®
                    account. A scope is a set of permissions to access your ORCID® account.
                </p>

                <p>
                    Note that that interaction with your ORCID® account will only be conducted while
                    you are logged in, in response to direct actions you take, and we will always
                    inform you when this is the case.
                </p>

                {this.renderRequestedScopes()}
            </div>
        );
    }

    render() {
        return (
            <Stack>
                <Row className="justify-content-center">
                    <Col style={{ maxWidth: '60em' }}>
                        {this.renderAccountInfo()}
                        {this.renderScopeInfo()}
                        {this.renderConfirmDialog()}
                    </Col>
                </Row>
            </Stack>
        );
    }
}
