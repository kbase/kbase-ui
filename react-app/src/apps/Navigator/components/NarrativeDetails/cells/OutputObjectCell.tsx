import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
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
        const { name, tag } = (() => {
            if (this.props.cell.metadata.kbase.outputCell.widget) {
                return this.props.cell.metadata.kbase.outputCell.widget;
            } else {
                return {
                    name: 'unknown',
                    tag: 'unknown',
                };
            }
        })();

        return (
            <div className="row my-2">
                <div className="col-auto d-flex align-items-start">
                    <DefaultIcon cellType="output" />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div
                                    style={{
                                        flex: '1 1 0',
                                        paddingRight: '2em',
                                        display: 'flex',
                                        flexDirection: 'row',
                                    }}
                                >
                                    <div className={styles.title}>{name}</div>
                                    <div className={styles.tag}>{tag}</div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className={styles.content}>
                                    More info about this output cell ...
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
