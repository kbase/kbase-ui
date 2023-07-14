import { Component, PropsWithChildren } from "react";
import Accordion from "react-bootstrap/esm/Accordion";

export interface CollapsibleHelpProps extends PropsWithChildren {
    title: string;
}

export class CollapsibleHelp extends Component<CollapsibleHelpProps>{
    render() {
        return <Accordion>
            <Accordion.Item eventKey="0">
                <Accordion.Header>{this.props.title}</Accordion.Header>
                <Accordion.Body>
                    {this.props.children}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    }
}
