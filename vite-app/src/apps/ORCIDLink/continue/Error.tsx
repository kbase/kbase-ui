import AlertMessage from 'components/AlertMessage';
import Well from 'components/Well';
import { Component } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { renderORCIDIcon } from '../common';
import { LinkRecord, ReturnInstruction } from '../lib/ORCIDLinkClient';
import { ORCID_URL } from '../lib/constants';
import styles from './Continue.module.css';
import { ContinueLinkingError, ErrorType } from './ContinueController';

export interface ErrorViewProps {
    error: ContinueLinkingError
    returnInstruction?: ReturnInstruction;
    cancelLink: () => Promise<void>;
}

export default class ErrorView extends Component<ErrorViewProps> {
    renderORCIDUserRecord(link: LinkRecord) {
        const {
            orcid_auth: { orcid, name }
        } = link;
        return (
            <Well variant="light">
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
                                {name}
                            </div>
                        </div>
                    </div>
                </Well.Body>
            </Well>
        );
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

    renderError() {
        switch (this.props.error.type) {
            case ErrorType.ALREADY_LINKED:
                return <div>
                    <p>Your KBase account is already linked to the following ORCID account:</p>
                    {this.renderORCIDUserRecord(this.props.error.link)}
                    <p style={{ marginTop: '1em' }}>Each KBase account may only be linked to a single ORCID account.</p>
                    <p>Conversely, an ORCID account may be linked to only one KBase account.</p>
                </div>
            case ErrorType.FETCH_LINK_SESSION_ERROR:
                return this.props.error.message;
        }
    }

    render() {
        return (
            <Well variant="danger">
                <Well.Header>Error</Well.Header>
                <Well.Body>
                    {this.renderError()}
                </Well.Body>
                <Well.Footer>
                    <Stack
                        direction="horizontal"
                        gap={3}
                        className="justify-content-center"
                        style={{ flex: '1 1 0' }}
                    >

                        <Button variant="danger" onClick={this.props.cancelLink}>
                            <span className="fa fa-lg fa-mail-reply" /> Cancel
                        </Button>
                    </Stack>
                </Well.Footer>
            </Well>
        );
    }
}
