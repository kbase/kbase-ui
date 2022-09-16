import { Component } from 'react';
import { ORCID_URL, ReturnLink, LinkingSessionInfo } from './Model';
import { renderORCIDIcon, renderScope } from './common';
import { Alert, Button } from 'react-bootstrap';
import styles from './Continue.module.css';
import AlertMessage from 'components/AlertMessage';

export interface ContinueProps {
    linkingSessionInfo: LinkingSessionInfo;
    returnLink?: ReturnLink;
    confirmLink: () => Promise<void>;
    cancelLink: () => Promise<void>;
}

export default class Continue extends Component<ContinueProps> {
    renderORCIDUserRecord() {
        const { orcid_auth: { orcid, scope }, created_at, expires_at } = this.props.linkingSessionInfo;
        return <div className="well" style={{ marginBottom: '1em' }}>
            <div className="well-body">
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
            </div>
        </div>
    }

    renderRequestedScopes() {
        const { orcid_auth: { orcid, scope }, created_at, expires_at } = this.props.linkingSessionInfo;
        return <div className="well" style={{ marginBottom: '1em' }}>
            <div className="well-body">
                <div className="flex-table">
                    <div className="flex-row">
                        <div className={`flex-col ${styles['-col1']}`}>
                            Scopes
                        </div>
                        <div className="flex-col -col2">
                            {renderScope(scope)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }



    renderReturnURL() {
        if (!this.props.returnLink) {
            return;
        }
        return <AlertMessage type="info" style={{ marginTop: '1em' }} title="After Linking...">
            After creating the link, your browser will be returned to <b>{this.props.returnLink.label}</b>.
        </AlertMessage>;
    }

    render() {
        return <div className={styles.main}>
            <div className="well">
                <div className="well-header">
                    Confirm Link to ORCID®
                </div>
                <div className="well-body">
                    <div className={styles.main}>
                        <p>Please confirm that the ORICD® account information below and the requested account access permissions.</p>

                        <div className="flex-table">
                            <div className="flex-row">
                                <div className="flex-col">
                                    <h4>ORCID® Account</h4>

                                    <p>The following ORCID® account will be linked to this KBase account.</p>

                                    <p>You may follow the <b>ORCID® Account ID</b> link below to inspect additional information about the account.</p>

                                    {this.renderORCIDUserRecord()}
                                </div>
                                <div className="flex-col" style={{ flex: '1.5 1 0' }}>
                                    <h4>Scopes being granted to KBase</h4>

                                    <p>KBase is requesting the "scopes" below to view or manipulate your account on your behalf. A scope is a set
                                        of permissions to access your ORCID® account.
                                    </p>

                                    <p>Note that that interaction with your ORCID® account will only be conducted while you are logged in,
                                        and in response to direct actions you take.
                                    </p>

                                    {this.renderRequestedScopes()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="well-footer">
                    <div style={{ width: '40em', margin: '0 auto 0 auto' }}>
                        <p>
                            By linking the ORCID® account above you will be granting KBase the ability to interact with
                            that account on your behalf. You may revoke this at any time.
                        </p>
                        {this.renderReturnURL()}
                        <div style={{ textAlign: 'center' }}>
                            <Button variant="primary" onClick={this.props.confirmLink}>
                                Create link to ORCID®
                            </Button>
                            {' '}
                            <Button variant="danger" onClick={this.props.cancelLink}>
                                Cancel
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>;
    }
}
