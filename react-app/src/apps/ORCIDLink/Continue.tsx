import { Component } from 'react';
import { ORCID_URL, TempLinkRecord } from './Model';
import styles from './Continue.module.css';
import { renderORCIDIcon, renderScope } from './common';
import { Button } from 'react-bootstrap';

export interface ContinueProps {
    tempLinkRecord: TempLinkRecord;
    confirmLink: () => Promise<void>;
    cancelLink: () => Promise<void>;
}

export default class Continue extends Component<ContinueProps> {

    renderORCIDUserRecord() {
        const { orcid_auth: { orcid, scope }, created_at, expires_at } = this.props.tempLinkRecord;
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
                            {this.props.tempLinkRecord.orcid_auth.name}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }

    renderRequestedScopes() {
        const { orcid_auth: { orcid, scope }, created_at, expires_at } = this.props.tempLinkRecord;
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

    render() {
        return <div className={styles.main}>
            <h2>Confirm Link to ORCID®</h2>
            <p>Please confirm that the ORICD® account information below and the requested account access permissions.</p>

            <div className="flex-table">
                <div className="flex-row">
                    <div className="flex-col">
                        <h3>ORCID® Account</h3>

                        <p>The following ORCID® account will be linked to this KBase account.</p>

                        <p>You may follow the <b>ORCID® Account ID</b> link below to inspect additional information about the account.</p>

                        {this.renderORCIDUserRecord()}
                    </div>
                    <div className="flex-col" style={{ flex: '1.5 1 0' }}>
                        <h3>Scopes being granted to KBase</h3>

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

            <div style={{ width: '40em', margin: '2em auto 0 auto' }}>
                <p>
                    By linking the ORCID® account above you will be granting KBase the ability to interact with
                    that account on your behalf. You may revoke this at any time.
                </p>
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



        </div>;
    }
}