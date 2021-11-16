import { Component } from 'react';
import { MarkdownCell } from '../../../utils/NarrativeModel';
import marked from 'marked';
import styles from './MarkdownCell.module.css';
import { DefaultIcon } from '../../Icon';
import { Accordion } from 'react-bootstrap';

interface MarkdownCellProps {
    cell: MarkdownCell;
}

export default class MarkdownCellView extends Component<MarkdownCellProps> {
    renderContent(content: string) {
        if (content.trim().length === 0) {
            return <div style={{ fontStyle: 'italic' }}>no content</div>;
        }
        return (
            <div
                dangerouslySetInnerHTML={{
                    __html: marked(this.props.cell.source),
                }}
            />
        );
    }

    render() {
        return (
            <div className="row my-2">
                <div className="col-auto d-flex align-items-center">
                    <DefaultIcon cellType="markdown" />
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={styles.title}>
                                    {this.props.cell.metadata.kbase &&
                                    this.props.cell.metadata.kbase.attributes
                                        ? this.props.cell.metadata.kbase
                                              .attributes.title
                                        : 'n/a'}
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className={styles.content}>
                                    {this.renderContent(this.props.cell.source)}
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                    {/* <div className={styles.title}>
                        {this.props.cell.metadata.kbase &&
                        this.props.cell.metadata.kbase.attributes
                            ? this.props.cell.metadata.kbase.attributes.title
                            : 'n/a'}
                    </div>
                    <div className={styles.content}>
                        {this.renderContent(this.props.cell.source)}
                    </div> */}
                </div>
            </div>
        );
    }
}
