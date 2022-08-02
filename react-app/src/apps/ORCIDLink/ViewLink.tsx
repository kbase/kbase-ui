import { Component } from 'react';
import { Button } from 'react-bootstrap';
import { LinkInfo } from './LinkController';
import styles from './ViewLink.module.css';
import { ORCID_URL } from './Model';
import { renderORCIDIcon, renderScope } from './common';


export interface StartProps {
    link: LinkInfo
    revoke: () => void
}


export default class ViewLink extends Component<StartProps> {
    render() {
        return <div className={styles.main}>
            <h1>
                Your ORCID® Link
            </h1>

            <div className="well" style={{ marginBottom: '1em' }}>
                <div className="well-body">
                    <div className="flex-table">
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                ORCID® Account ID
                            </div>
                            <div className="flex-col -col2">
                                <div className="flex-row" style={{ alignItems: 'center' }}>
                                    <a href={`${ORCID_URL}/${this.props.link.orcidID}`} target="_blank">
                                        {renderORCIDIcon()}
                                        {this.props.link.orcidID}
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Name on Account
                            </div>
                            <div className="flex-col">
                                {this.props.link.realname}
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Created on
                            </div>
                            <div className="flex-col -col2">
                                {Intl.DateTimeFormat('en-US').format(this.props.link.createdAt)}
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Expires on
                            </div>
                            <div className="flex-col -col2">
                                {Intl.DateTimeFormat('en-US').format(this.props.link.expiresAt)}
                            </div>
                        </div>
                        <div className="flex-row">
                            <div className={`flex-col ${styles['-col1']}`}>
                                Scopes
                            </div>
                            <div className="flex-col -col2">
                                {renderScope(this.props.link.scope)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={styles.col1}>
                    <h3>About</h3>
                    <p>The ORCID® Link allows you to use KBase tools which access your ORCID® profile, and update your ORCID® research works with KBase published narratives and data.</p>

                    <p>Note that this link will only be used when you are signed in to KBase. In addition,
                        any tool which uses ORCID® link will inform you.
                    </p>
                    <h3>Demos</h3>
                    <ul>
                        <li>
                            <a href="/#orcidlink/demos/prefill-form">Pre-Fill Form</a>
                        </li>
                        <li>
                            <a href="/#orcidlink/demos/push-publication">Push Publication</a>
                        </li>
                    </ul>
                </div>
                <div className={styles.col2}>
                    <h3>Revocation</h3>
                    <p>You may <b>revoke</b> this link at any time.</p>

                    <p>Revoking the link will not alter any of your data at KBase, nor anything at ORCID®.</p>

                    <p>Please note that if you wish to revoke this link at KBase, you may also
                        want to revoke the permissions granted to KBase at ORCID® as well.</p>

                    <Button variant="danger" onClick={this.props.revoke}>
                        Revoke Link to ORCID®
                    </Button>
                </div>
            </div>

        </div>;
    }
}
