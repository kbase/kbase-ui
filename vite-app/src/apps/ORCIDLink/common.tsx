import { image } from 'components/images';
import { Accordion, Image } from 'react-bootstrap';
import { SCOPE_HELP } from './lib/Model';
import { SCOPE } from './lib/constants';

export function renderORCIDIcon() {
    return <Image src={image('orcidIcon')} style={{ height: '24px', marginRight: '0.25em' }} />
}

export function renderORCIDLabel() {
    return `ORCID®`;
}

export function renderORCIDLinkLabel() {
    return `KBase ORCID® Link`;
}

export function renderScope(scopes: string) {
    const rows = scopes.split(/\s+/).map((scope: string, index) => {
        const { orcid, help, seeAlso } = SCOPE_HELP[scope as SCOPE];
        return <Accordion.Item eventKey={String(index)} style={{ width: '100%' }} key={scope}>
            <Accordion.Header>
                {orcid.label}
            </Accordion.Header>
            <Accordion.Body>
                <h5>ORCID® Policy</h5>
                <p>{orcid.tooltip}</p>
                <h5>How KBase Uses It</h5>
                {help.map((item, index) => { return <p key={index}>{item}</p>; })}
                <h5>See Also</h5>
                <ul>
                    {seeAlso.map(({ url, label }, index) => { return <li key={index}><a href={url} target="_blank">{label}</a></li> })}
                </ul>
            </Accordion.Body>
        </Accordion.Item >
    });
    return <Accordion>
        {rows}
    </Accordion >;
}
