import React, { Component, PropsWithChildren } from "react";
import styles from './Well.module.css';

// export type WellProps = PropsWithChildren<{
//     style?: React.CSSProperties
// }>

// HEADER

export class HeaderProps {
    style?: React.CSSProperties
}

export class Header extends Component<PropsWithChildren<HeaderProps>> {
    render() {
        return <div className={styles.header} style={this.props.style}>
            {this.props.children}
        </div>
    }
}

// BODY


export class BodyProps {
    style?: React.CSSProperties
}

export class Body extends Component<PropsWithChildren<BodyProps>> {
    render() {
        return <div className={styles.body} style={this.props.style}>
            {this.props.children}
        </div>
    }
}


// FOOTER

export class FooterProps {
    style?: React.CSSProperties
}

export class Footer extends Component<PropsWithChildren<FooterProps>> {
    render() {
        return <div className={styles.footer} style={this.props.style}>
            {this.props.children}
        </div>
    }
}

export type Variant = 'primary' | 'info' | 'warning' | 'danger' | 'success';


// Main Component

export type WellProps = {
    style?: React.CSSProperties
    children?: React.ReactNode | Array<React.ReactNode>
    variant?: Variant;
}

interface WellState {

}

export default class Well extends Component<WellProps, WellState> {
    static Header = Header;
    static Body = Body;
    static Footer = Footer;

    render() {
        const variantStyle = (() => {
            if (!this.props.variant) {
                return styles.variantNone;
            }
            switch (this.props.variant) {
                case 'primary':
                    return styles.variantPrimary;
                case 'info':
                    return styles.variantInfo;
                case 'warning':
                    return styles.variantWarning;
                case 'danger':
                    return styles.variantDanger;
                case 'success':
                    return styles.variantSuccess;
            }
        })();
        return <div className={`${styles.well} ${variantStyle}`} style={this.props.style}>
            {this.props.children}
        </div>
    }
}

