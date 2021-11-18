import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { CodeCell } from '../../../utils/NarrativeModel';
import { DefaultIcon } from '../../Icon';
import styles from './CodeCell.module.css';
import cellStyles from './cell.module.css';

interface CodeCellProps {
    cell: CodeCell;
}

export default class CodeCellView extends Component<CodeCellProps> {
    render() {
        return (
            <div className="row my-2 g-0">
                <div className="col-md-2 d-flex flex-column align-items-center justify-content-start">
                    <div>
                        <DefaultIcon cellType="code" />
                    </div>
                    <div
                        style={{
                            fontSize: '80%',
                            color: 'rgb(150 150 150)',
                            fontStyle: 'italic',
                            textAlign: 'center',
                        }}
                    >
                        python code
                    </div>
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={cellStyles.header}>
                                    <div className={cellStyles.title}>
                                        {
                                            this.props.cell.metadata.kbase
                                                .attributes.title
                                        }
                                    </div>
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
