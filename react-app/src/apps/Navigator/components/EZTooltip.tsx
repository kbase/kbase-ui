import { Component, ReactElement } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

export interface EZTooltipProps {
    id: string;
    tooltip: ReactElement | string;
    children: ReactElement;
}

export default class EZTooltip extends Component<EZTooltipProps> {
    render() {
        return (
            <OverlayTrigger
                placement="top"
                overlay={(props) => {
                    return (
                        <Tooltip id={this.props.id} {...props}>
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
