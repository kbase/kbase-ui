import { Component } from 'react';
import { DefaultIcon } from '../../Icon';
import styles from './UnrecognizedCell.module.css';

interface UnrecognizedCellProps {
    // cell: CodeCell;
    title: string;
    content: string;
}

export default class UnrecognizedCellView extends Component<UnrecognizedCellProps> {
    render() {
        return (
            <div className="row my-2">
                <div className="col-auto d-flex align-items-center">
                    <DefaultIcon cellType="error" />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <div className={styles.title}>{this.props.title}</div>
                    <div className={styles.content}>{this.props.content}</div>
                </div>
            </div>
        );
    }
}
