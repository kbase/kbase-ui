import { CSSProperties, Component, PropsWithChildren } from "react";

export interface TextSpanProps extends PropsWithChildren {
    bold?: boolean;
    last?: boolean;
    style?: CSSProperties;
}

export default class TextSpan extends Component<TextSpanProps> {
    render() {
        const style: CSSProperties = this.props.style ? this.props.style : {};

        if (this.props.bold) {
            style.fontWeight = 'bold';
        }
        if (this.props.last) {
            style.margin = '0 0 0 0.25em';
        } else {
            style.margin = '0 0.25em';
        }
        return <span style={style}>
            {this.props.children}
        </span>
    }
}
