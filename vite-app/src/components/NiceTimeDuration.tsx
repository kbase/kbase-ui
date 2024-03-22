import { niceDuration } from '@kbase/ui-lib';
import { Tooltip } from 'antd';
import { Component } from 'react';

export interface NiceTimeDurationProps {
    duration: number;
    precision?: number;
    showTooltip?: boolean;
    tooltipPrefix?: string;
}

interface NiceTimeDurationState { }

export default class NiceTimeDuration extends Component<NiceTimeDurationProps, NiceTimeDurationState> {
    render() {
        if (this.props.showTooltip === false) {
            return <span>{niceDuration(this.props.duration, {})}</span>;
        }

        const fullElapsed = <span>{niceDuration(this.props.duration, {})}</span>;
        let tooltip;
        if (this.props.tooltipPrefix) {
            tooltip = (
                <span>
                    {this.props.tooltipPrefix}
                    {fullElapsed}
                </span>
            );
        } else {
            tooltip = fullElapsed;
        }
        return (
            <Tooltip placement="bottomRight" title={tooltip}>
                <span>{niceDuration(this.props.duration, { precision: this.props.precision })}</span>
            </Tooltip>
        );
    }
}
