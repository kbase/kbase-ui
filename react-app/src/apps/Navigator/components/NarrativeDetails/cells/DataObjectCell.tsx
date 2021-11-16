import { Component } from 'react';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { AuthInfo } from '../../../../../contexts/Auth';
import { Config } from '../../../../../types/config';
import { DataObjectCell } from '../../../utils/NarrativeModel';
import { TypeIcon } from '../../Icon';
import styles from './DataObjectCell.module.css';

interface DataObjectCellProps {
    cell: DataObjectCell;
    authInfo: AuthInfo;
    config: Config;
}

export default class DataObjectCellView extends Component<DataObjectCellProps> {
    render() {
        if (!('dataCell' in this.props.cell.metadata.kbase)) {
            return (
                <div className="row my-2">
                    <div className="col-auto">
                        <ErrorMessage message="Cell type is 'data', but doesn't have 'dataCell'" />
                    </div>
                </div>
            );
        }
        const { name, type } =
            this.props.cell.metadata.kbase.dataCell.objectInfo;
        return (
            <div className="row my-2">
                <div className="col-auto d-flex align-items-center">
                    <TypeIcon
                        objectType={type}
                        authInfo={this.props.authInfo}
                        config={this.props.config}
                    />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <div className={styles.title}>{name}</div>
                    <div className={styles.type}>{type}</div>
                </div>
            </div>
        );
    }
}
