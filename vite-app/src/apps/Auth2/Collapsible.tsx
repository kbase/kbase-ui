import Well, { Variant } from "components/Well";
import { CSSProperties, Component, PropsWithChildren, ReactNode } from "react";
import { Button, Collapse } from "react-bootstrap";
import './Collapsible.css';

export interface CollapsibleProps extends PropsWithChildren {
    title: ReactNode;
    variant: Variant;
    style?: CSSProperties;
    // Annoying to need a render prop; but the Collapse component does not take the 
    // standard react children prop.
    render: () => JSX.Element;
}

interface CollapsibleState {
    open: boolean;
}

export default class Collapsible extends Component<CollapsibleProps, CollapsibleState> {
    constructor(props: CollapsibleProps) {
        super(props);
        this.state = {
            open: false
        }
    }

    render() {
        return <div className="Collapsible" style={this.props.style}>
            <Button onClick={() => {
                this.setState({open: !this.state.open})
            }}
                    aria-controls="collapsible-content"
                    aria-expanded={this.state.open} 
                    variant={`${this.props.variant}`}
                    style={{display: 'inline'}}
            >
                {this.props.title}
            </Button>
            <Collapse in={this.state.open} >
                <Well variant={this.props.variant}>
                    <Well.Body>
                        {this.props.render()}
                    </Well.Body>
                </Well>
            </Collapse>
        </div>
    }
}