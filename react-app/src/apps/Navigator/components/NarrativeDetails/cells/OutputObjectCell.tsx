import { Component } from 'react';
import { Accordion, Table } from 'react-bootstrap';
import ErrorMessage from '../../../../../components/ErrorMessage';
import { OutputObjectCell } from '../../../utils/NarrativeModel';
import { DefaultIcon } from '../../Icon';
import styles from './OutputObject.module.css';
import cellStyles from './cell.module.css';
import EZTooltip from '../../EZTooltip';
import RenderJSON from '../../../../../components/RenderJSON';

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
        const { name } = (() => {
            if (this.props.cell.metadata.kbase.outputCell.widget) {
                return this.props.cell.metadata.kbase.outputCell.widget;
            } else {
                return {
                    name: 'unknown',
                };
            }
        })();
        const { title } = (() => {
            if (this.props.cell.metadata.kbase.attributes) {
                return this.props.cell.metadata.kbase.attributes;
            } else {
                return {
                    title: 'unknown',
                };
            }
        })();

        console.log('OUTPUT', this.props.cell);

        return (
            <div className="row my-2 g-0">
                <div className="col-md-2 d-flex flex-column align-items-center justify-content-start">
                    <div>
                        <DefaultIcon cellType="output" />
                    </div>
                    <div
                        style={{
                            fontSize: '80%',
                            color: 'rgb(150 150 150)',
                            fontStyle: 'italic',
                            textAlign: 'center',
                        }}
                    >
                        app output
                    </div>
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={cellStyles.header}>
                                    <div className={cellStyles.title}>
                                        {title}
                                    </div>
                                    <div className={cellStyles.subtitle}>
                                        {name}
                                    </div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className={styles.content}>
                                    <Table size="sm" bordered>
                                        <tbody>
                                            <tr>
                                                <th>Widget</th>
                                                <td>
                                                    <EZTooltip
                                                        id="saved-at-tooltip"
                                                        tooltip={
                                                            this.props.cell
                                                                .metadata.kbase
                                                                .outputCell
                                                                .widget.name
                                                        }
                                                    >
                                                        <span>
                                                            {
                                                                this.props.cell
                                                                    .metadata
                                                                    .kbase
                                                                    .outputCell
                                                                    .widget.name
                                                            }
                                                        </span>
                                                    </EZTooltip>
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Tag</th>
                                                <td>
                                                    {
                                                        this.props.cell.metadata
                                                            .kbase.outputCell
                                                            .widget.tag
                                                    }
                                                </td>
                                            </tr>
                                            <tr>
                                                <th>Params</th>
                                                <td>
                                                    <RenderJSON
                                                        value={
                                                            this.props.cell
                                                                .metadata.kbase
                                                                .outputCell
                                                                .widget.params
                                                        }
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
