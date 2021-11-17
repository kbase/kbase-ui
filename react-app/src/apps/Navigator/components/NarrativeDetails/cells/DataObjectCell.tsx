import { Component } from 'react';
import { Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { AuthInfo } from '../../../../../contexts/Auth';
import { Config } from '../../../../../types/config';
import { DataObjectCell } from '../../../utils/NarrativeModel';
import EZTooltip from '../../EZTooltip';
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
                <div className="col-auto d-flex align-items-start">
                    <TypeIcon
                        objectType={type}
                        authInfo={this.props.authInfo}
                        config={this.props.config}
                    />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={styles.header}>
                                    <div className={styles.title}>
                                        <EZTooltip
                                            id="title-toolip"
                                            tooltip={name}
                                        >
                                            <span>{name}</span>
                                        </EZTooltip>
                                    </div>

                                    <div className={styles.type}>
                                        <EZTooltip
                                            id="type-toolip"
                                            tooltip={
                                                <div
                                                    style={{
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    Type:
                                                    <br />
                                                    {type}
                                                </div>
                                            }
                                        >
                                            <span>{type}</span>
                                        </EZTooltip>
                                    </div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className={styles.content}>
                                    More info about this object ...
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
