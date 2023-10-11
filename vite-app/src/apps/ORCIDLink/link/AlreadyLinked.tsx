import Well from 'components/Well';
import { Component } from 'react';
import { Button } from 'react-bootstrap';

import LinkInfoView from '../LinkInfoView';
import { ReturnInstruction } from '../lib/ORCIDLinkClient';

import { LinkInfo } from '../lib/Model';
import styles from './ViewLink.module.css';


export interface AlreadyLinkedProps {
    link: LinkInfo
    orcidSiteURL: string;
    returnInstruction?: ReturnInstruction;
    returnFromWhence: () => void;
}

export default class AlreadyLinked extends Component<AlreadyLinkedProps> {

    renderReturn() {
        if (!this.props.returnInstruction) {
            return <p>
                <Button onClick={this.props.returnFromWhence}>Return to the KBase ORCID® Link home page</Button>
            </p>
        }

        return <p>
            <Button onClick={this.props.returnFromWhence}>Return to {this.props.returnInstruction.label}</Button>
        </p>

    }
    render() {
        return <div className={styles.main}>
            <Well variant="warning">
                <Well.Header>
                    Already Linked
                </Well.Header>
                <Well.Body>
                    <p>
                        Your KBase account is already linked to an ORCID® account.
                    </p>

                    <LinkInfoView link={this.props.link} orcidSiteURL={this.props.orcidSiteURL} />
                    <p style={{ marginTop: '1em' }}>
                        Each KBase account may have only a single ORCID® iD linked. Conversely, an ORCID® iD may
                        only be linked to one KBase account.
                    </p>
                    {this.renderReturn()}
                </Well.Body>
            </Well>
        </div>;
    }
}
