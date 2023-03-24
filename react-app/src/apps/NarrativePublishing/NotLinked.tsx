import Well from 'components/Well';
import { changeHash2 } from 'lib/navigation';
import { Component } from 'react';
import { Button } from 'react-bootstrap';

export interface NotLinkedProps {}

interface NotLinkedState {}

export default class NotLinked extends Component<NotLinkedProps, NotLinkedState> {
    createLinkingLink() {
        const linkingURL = new URL(`${document.location.origin}/#orcidlink/link`);
        const returnURL = new URL(document.location.href);
        const returnLink = {
            url: returnURL.toString(),
            label: `Narrative Publication Manager`,
        };
        linkingURL.searchParams.set('return_link', JSON.stringify(returnLink));
        return linkingURL;
        // return <a href={`${linkingURL.toString()}`}>Click here to link your KBase account to your ORCID account <i>(go to step {step})</i></a>
    }
    doLink() {
        document.location.href = this.createLinkingLink().toString();
        // alert('ok, ok, I will link ya.');
    }
    doCancel() {
        changeHash2('');
    }
    render() {
        return (
            <Well variant="warning" style={{ maxWidth: '60em', margin: '0 auto' }}>
                <Well.Header>Not Linked</Well.Header>
                <Well.Body>
                    <p>
                        I'm sorry, dear friend, but it appears that your KBase account is not linked
                        to an ORCID account.
                    </p>
                    <p>
                        In order to add your KBase published Narratives to your ORCID profile,
                        you'll need to link it first.
                    </p>
                </Well.Body>
                <Well.Footer style={{ justifyContent: 'center' }}>
                    <Button variant="primary" className="me-2" onClick={this.doLink.bind(this)}>
                        Create ORCID Link
                    </Button>
                    <Button
                        variant="outline-danger"
                        className="me-2"
                        onClick={this.doCancel.bind(this)}
                    >
                        Nope, not now
                    </Button>
                </Well.Footer>
            </Well>
        );
    }
}
