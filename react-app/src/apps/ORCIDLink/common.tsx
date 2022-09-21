import { Accordion, Button, Image } from 'react-bootstrap';
import { SCOPE } from './constants';
import orcidIcon from './images/ORCID-iD_icon-vector.svg';
import { SCOPE_HELP } from './Model';

export function renderORCIDIcon() {
    return <Image src={orcidIcon} style={{ height: '1em', marginRight: '0.25em' }} />
}

export function renderScope(scopes: string) {
    const rows = scopes.split(/\s+/).map((scope: string, index) => {
        const { label, orcid, help } = SCOPE_HELP[scope as SCOPE];
        return <Accordion.Item eventKey={String(index)} style={{ width: '100%' }} key={scope}>
            <Accordion.Header>
                {orcid.label}
            </Accordion.Header>
            <Accordion.Body>
                <h5>ORCID Policy</h5>
                <p>{orcid.tooltip}</p>
                <h5>How KBase Uses It</h5>
                {help.map((item, index) => { return <p key={index}>{item}</p>; })}
            </Accordion.Body>
        </Accordion.Item >
    });
    return <Accordion>
        {rows}
    </Accordion >;
}
