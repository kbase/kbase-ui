import { Component } from 'react';

export interface IconSpinnerProps {
    iconClass: string;
    isActive: boolean;
}

export default class IconSpinner extends Component<IconSpinnerProps> {
    renderIcon() {
        if (this.props.isActive) {
            return <span className="fa fa-spinner fa-pulse"></span>;
        } else {
            return <span className={`fa ${this.props.iconClass}`} />;
        }
    }

    render() {
        return (
            <div style={{ display: 'inline-block', width: '1em' }}>
                {this.renderIcon()}
            </div>
        );
    }
}
