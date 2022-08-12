import React, { Component, PropsWithChildren } from "react";
import styles from './Well.module.css';

// export type WellProps = PropsWithChildren<{
//     style?: React.CSSProperties
// }>

export type WellProps = {
    style?: React.CSSProperties
    children?: React.ReactNode | Array<React.ReactNode>
}

interface WellState {

}

export default class Well extends Component<WellProps, WellState> {

    render() {
        return <div className={styles.well} style={this.props.style}>
            {this.props.children}
        </div>
    }
}