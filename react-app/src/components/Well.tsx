import React, { Component, PropsWithChildren } from "react";
import styles from './Well.module.css';

// export type WellProps = PropsWithChildren<{
//     style?: React.CSSProperties
// }>

// HEADER

export class HeaderProps {

}

export class Header extends Component<PropsWithChildren<HeaderProps>> {
    render() {
        return <div className={styles.header}>
            {this.props.children}
        </div>
    }
}

// BODY


export class BodyProps {

}

export class Body extends Component<PropsWithChildren<BodyProps>> {
    render() {
        return <div className={styles.body}>
            {this.props.children}
        </div>
    }
}


// FOOTER

export class FooterProps {

}

export class Footer extends Component<PropsWithChildren<FooterProps>> {
    render() {
        return <div className={styles.body}>
            {this.props.children}
        </div>
    }
}


// Main Component

export type WellProps = {
    style?: React.CSSProperties
    children?: React.ReactNode | Array<React.ReactNode>
}

interface WellState {

}

export default class Well extends Component<WellProps, WellState> {
    static Header = Header;
    static Body = Body;
    static Footer = Footer;
    render() {
        return <div className={styles.well} style={this.props.style}>
            {this.props.children}
        </div>
    }
}

