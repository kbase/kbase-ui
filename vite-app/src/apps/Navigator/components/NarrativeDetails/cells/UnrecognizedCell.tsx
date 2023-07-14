import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { DefaultIcon } from '../../Icon';
import styles from './UnrecognizedCell.module.css';
import cellStyles from './cell.module.css';

interface UnrecognizedCellProps {
    // cell: CodeCell;
    title: string;
    content: string;
}

export default class UnrecognizedCellView extends Component<UnrecognizedCellProps> {
    render() {
        // return (
        //     <div className="row my-2">
        //         <div className="col-auto d-flex align-items-start">
        //             <DefaultIcon cellType="error" />
        //         </div>
        //         <div className="col" style={{ minWidth: 0 }}>
        //             <div className={styles.title}>{this.props.title}</div>
        //             <div className={styles.content}>{this.props.content}</div>
        //         </div>
        //     </div>
        // );
        return (
            <div className="row my-2 g-0">
                <div className="col-md-2 d-flex flex-column align-items-center justify-content-start">
                    <div>
                        <DefaultIcon cellType="error" />
                    </div>
                    <div
                        style={{
                            fontSize: '80%',
                            color: 'rgb(150 150 150)',
                            fontStyle: 'italic',
                            textAlign: 'center',
                        }}
                    >
                        unknown cell type
                    </div>
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={cellStyles.header}>
                                    <div className={cellStyles.title}>
                                        {this.props.title}
                                    </div>
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className={styles.content}>
                                    {this.props.content}
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
