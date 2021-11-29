import { Component } from 'react';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { AuthInfo } from '../../../../../contexts/Auth';
import { Config } from '../../../../../types/config';
import { DataObjectCell } from '../../../utils/NarrativeModel';
import EZTooltip from '../../EZTooltip';
import { TypeIcon } from '../../Icon';
import { Accordion, Button, Tab, Table, Tabs } from 'react-bootstrap';

import styles from './DataObjectCell.module.css';
import cellStyles from './cell.module.css';
import { niceRelativeTime } from '../../../../../lib/time';

interface DataObjectCellProps {
    cell: DataObjectCell;
    authInfo: AuthInfo;
    config: Config;
}

export default class DataObjectCellView extends Component<DataObjectCellProps> {
    renderObject() {
        const info = this.props.cell.metadata.kbase.dataCell.objectInfo;
        return (
            <div className={styles.ObjectInfo}>
                <Button
                    href={`/#dataview/${info.ref}`}
                    target="_blank"
                    variant="outline-info"
                >
                    Landing Page
                </Button>
                <div className={styles.title}>Object</div>
                <Table size="sm" bordered>
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <td>{info.id}</td>
                        </tr>
                        <tr>
                            <th>Name</th>
                            <td>{info.name}</td>
                        </tr>
                    </tbody>
                </Table>
                <div className={styles.title}>Type</div>
                <Table size="sm" bordered>
                    <tbody>
                        <tr>
                            <th>Type</th>
                            <td>
                                <a
                                    href={`/#spec/type/${info.type}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {info.typeName}
                                </a>{' '}
                                ({info.typeModule})
                            </td>
                        </tr>
                        <tr>
                            <th>Version</th>
                            <td>
                                {info.typeMajorVersion}.{info.typeMinorVersion}
                            </td>
                        </tr>
                    </tbody>
                </Table>
                <div className={styles.title}>Saved</div>
                <Table size="sm" bordered>
                    <tbody>
                        <tr>
                            <th>When</th>
                            <td>
                                <EZTooltip
                                    id="saved-at-tooltip"
                                    tooltip={Intl.DateTimeFormat(
                                        'en-US'
                                    ).format(new Date(info.saveDate))}
                                >
                                    <span>
                                        {niceRelativeTime(
                                            new Date(info.saveDate)
                                        )}
                                    </span>
                                </EZTooltip>
                            </td>
                        </tr>
                        <tr>
                            <th>By</th>
                            <td>
                                <a
                                    href={`/#user/${info.saved_by}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {info.saved_by}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <th>Version</th>
                            <td>{info.version}</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        );
    }

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
                                <Tabs variant="tabs" defaultActiveKey="info">
                                    <Tab eventKey="info" title="Info">
                                        <div className={styles.tabContent}>
                                            {this.renderObject()}
                                        </div>
                                    </Tab>
                                </Tabs>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
