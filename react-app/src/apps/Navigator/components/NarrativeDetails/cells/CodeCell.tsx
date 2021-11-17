import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
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
                <div className="col-auto  d-flex align-items-start">
                    <DefaultIcon cellType="code" />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={styles.title}>
                                    {
                                        this.props.cell.metadata.kbase
                                            .attributes.title
                                    }
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className={styles.content}>
                                    {this.props.cell.source}
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
