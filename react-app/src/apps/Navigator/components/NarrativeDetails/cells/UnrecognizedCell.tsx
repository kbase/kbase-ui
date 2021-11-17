import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { DefaultIcon } from '../../Icon';
import styles from './UnrecognizedCell.module.css';

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
            <div className="row my-2">
                <div className="col-auto d-flex align-items-start">
                    <DefaultIcon cellType="error" />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={styles.title}>
                                    {this.props.title}
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
