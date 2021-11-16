import { Component } from 'react';
import { CodeCell } from '../../../utils/NarrativeModel';
import { DefaultIcon } from '../../Icon';
import styles from './CodeCell.module.css';

interface CodeCellProps {
    cell: CodeCell;
}

export default class CodeCellView extends Component<CodeCellProps> {
    render() {
        return (
            <div className="row my-2">
                <div className="col-auto  d-flex align-items-center">
                    <DefaultIcon cellType="code" />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <div className={styles.title}>
                        {this.props.cell.metadata.kbase.attributes.title}
                    </div>
                    <div className={styles.content}>
                        {this.props.cell.source}
                    </div>
                </div>
            </div>
        );
    }
}
