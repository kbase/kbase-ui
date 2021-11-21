import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { AuthInfo } from '../../../../../contexts/Auth';
import { Config } from '../../../../../types/config';
import { DataObjectCell } from '../../../utils/NarrativeModel';
import EZTooltip from '../../EZTooltip';
import { TypeIcon } from '../../Icon';
import styles from './DataObjectCell.module.css';
import cellStyles from './cell.module.css';

interface DataObjectCellProps {
    cell: DataObjectCell;
    authInfo: AuthInfo;
    config: Config;
}

export default class DataObjectCellView extends Component<DataObjectCellProps> {
    render() {
        if (!('dataCell' in this.props.cell.metadata.kbase)) {
            return (
                <div className="row my-2 g-0">
                    <div className="col-auto">
                        <ErrorMessage message="Cell type is 'data', but doesn't have 'dataCell'" />
                    </div>
                </div>
            );
        }
        const { name, type, typeName } =
            this.props.cell.metadata.kbase.dataCell.objectInfo;
        return (
            <div className="row my-2 g-0">
                <div className="col-md-2 d-flex flex-column align-items-center justify-content-start">
                    <div>
                        <TypeIcon
                            objectType={type}
                            authInfo={this.props.authInfo}
                            config={this.props.config}
                        />
                    </div>
                    <div
                        style={{
                            fontSize: '80%',
                            color: 'rgb(150 150 150)',
                            fontStyle: 'italic',
                            textAlign: 'center',
                        }}
                    >
                        object viewer
                    </div>
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={cellStyles.header}>
                                    <div className={cellStyles.title}>
                                        <EZTooltip
                                            id="title-toolip"
                                            tooltip={name}
                                        >
                                            <span>{name}</span>
                                        </EZTooltip>
                                    </div>

                                    <div className={cellStyles.subtitle}>
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
                                            <span>{typeName}</span>
                                        </EZTooltip>
                                    </div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className={styles.content}>
                                    More info about this object and its viewer
                                    ...
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
