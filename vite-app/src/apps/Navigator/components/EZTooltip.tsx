import { Component, ReactElement } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';

export interface EZTooltipProps {
    id?: string;
    tooltip: ReactElement | string;
    children: ReactElement;
}

export default class EZTooltip extends Component<EZTooltipProps> {
    render() {
        const id = this.props.id || uuidv4();
        return (
            <OverlayTrigger
                placement="top"
                overlay={(props) => {
                    return (
                        <Tooltip id={id} {...props}>
                            {this.props.tooltip}
                        </Tooltip>
                    );
                }}
            >
                {this.props.children}
            </OverlayTrigger>
        );
    }
}
