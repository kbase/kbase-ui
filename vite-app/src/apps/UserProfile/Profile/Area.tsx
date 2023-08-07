import { CSSProperties, Component, PropsWithChildren } from 'react';
import './Area.css';

export interface AreaProps extends PropsWithChildren {
    title?: string;
    maxHeight?: string;
    scroll?: 'scroll' | 'auto' | 'hidden';
    style?: CSSProperties;
}

export default class Area extends Component<AreaProps> {
    render() {
        const bodyStyle: React.CSSProperties = {
        };
        if (this.props.maxHeight) {
            bodyStyle.maxHeight = this.props.maxHeight;
            bodyStyle.overflowY = 'auto';
        } else if (this.props.scroll) {
            bodyStyle.overflowY = this.props.scroll;
        }
        let title;
        if (this.props.title) {
            title = <div className="Area-title">{this.props.title}</div>;
        }
        return <div className='Area' style={this.props.style}>
            {title}
            <div className="Area-body" style={bodyStyle}>
                {this.props.children}
            </div>
        </div>;
    }
}