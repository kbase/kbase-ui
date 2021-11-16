import { Component } from 'react';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { OutputObjectCell } from '../../../utils/NarrativeModel';
import { DefaultIcon } from '../../Icon';
import styles from './OutputObject.module.css';

interface OutputObjectCellProps {
    cell: OutputObjectCell;
}

export default class OutputObjectCellView extends Component<OutputObjectCellProps> {
    render() {
        if (!('outputCell' in this.props.cell.metadata.kbase)) {
            return (
                <div className="row my-2">
                    <div className="col-auto">
                        <ErrorMessage message="Cell type is 'output', but doesn't have 'outputCell'" />
                    </div>
                </div>
            );
        }
        const { name, tag } = this.props.cell.metadata.kbase.outputCell.widget;
        return (
            <div className="row my-2">
                <div className="col-auto d-flex align-items-center">
                    <DefaultIcon cellType="output" />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <div className={styles.name}>{name}</div>
                    <div className={styles.tag}>{tag}</div>
                </div>
            </div>
        );
    }
}
