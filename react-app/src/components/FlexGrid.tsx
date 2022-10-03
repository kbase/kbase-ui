import React, { Component, PropsWithChildren } from "react";
import styles from './FlexGrid.module.css';

// export type WellProps = PropsWithChildren<{
//     style?: React.CSSProperties
// }>

// Row

export class RowProps {

    style?: React.CSSProperties
}

export class Row extends Component<PropsWithChildren<RowProps>> {
    render() {
        return <div className={styles.row} style={this.props.style}>
            {this.props.children}
        </div>
    }
}

// Column


export class ColProps {
    style?: React.CSSProperties
}

export class Col extends Component<PropsWithChildren<ColProps>> {
    render() {
        return <div className={styles.col} style={this.props.style}>
            {this.props.children}
        </div>
    }
}


// // FOOTER

// export class FooterProps {

// }

// export class Footer extends Component<PropsWithChildren<FooterProps>> {
//     render() {
//         return <div className={styles.body}>
//             {this.props.children}
//         </div>
//     }
// }


// Main Component

export type FlexGridProps = {
    style?: React.CSSProperties
    children?: React.ReactNode | Array<React.ReactNode>
}

interface FlexGridState {

}

export default class Well extends Component<FlexGridProps, FlexGridState> {
    static Row = Row;
    static Col = Col;
    render() {
        return <div className={styles.grid} style={this.props.style}>
            {this.props.children}
        </div>
    }
}

