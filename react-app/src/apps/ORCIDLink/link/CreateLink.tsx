import AlertMessage from 'components/AlertMessage';
import styles from './CreateLink.module.css';
import { Component } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { ReturnLink } from '../Model';

export interface CreateLinkProps {
    returnLink?: ReturnLink;
    skipPrompt?: boolean;
    start: () => void;
    goBack: () => void;
}

export default class CreateLink extends Component<CreateLinkProps> {
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
            <div className={styles.row}>
                <div className="well" style={{ maxWidth: '60em', margin: '0 auto' }}>
                    <div className="well-header">
                        Create Link to ORCID®
                    </div>

                    <div className="well-body">
                        <p>You do not currently have a link from your KBase account to an ORCID® account.</p>

                        <p>When clicking the button below, you will be redirected to ORCID®, where you may
                            sign in to your ORCID® account and grant permission to KBase to access certain
                            aspects of your ORCID® account.
                        </p>

                        {this.renderReturnURL()}
                    </div>
                    <div className="well-footer">
                        <Stack direction="horizontal" gap={3} className="justify-content-center">
                            <Button variant="primary" onClick={this.props.start}>
                                Create ORCID® Link
                            </Button>
                            <Button variant="danger" onClick={this.props.goBack}>
                                Cancel and Return from Whence You Came
                            </Button>
                        </Stack>
                    </div>

                </div>
            </div>
        </div >;
    }
}