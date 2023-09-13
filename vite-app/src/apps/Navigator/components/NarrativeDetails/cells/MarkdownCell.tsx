import DOMPurify from 'dompurify';
import { MarkdownCell } from 'lib/clients/NarrativeModel';
import { marked } from 'marked';
import { Component } from 'react';
import { Accordion } from 'react-bootstrap';
import { DefaultIcon } from '../../Icon';
import styles from './MarkdownCell.module.css';
import cellStyles from './cell.module.css';

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
                    __html: DOMPurify.sanitize(marked.parse(this.props.cell.source))
                }}
            />
        );
    }

    render() {
        return (
            <div className={`row my-2 g-0 ${styles.MarkdownCell}`}>
                <div className="col-md-2 d-flex flex-column align-items-center justify-content-start">
                    <div>
                        <DefaultIcon cellType="markdown" />
                    </div>
                    <div
                        style={{
                            fontSize: '80%',
                            color: 'rgb(150 150 150)',
                            fontStyle: 'italic',
                            textAlign: 'center',
                        }}
                    >
                        markdown
                    </div>
                </div>
                <div className="col" style={{ minWidth: 0 }}>
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <div className={cellStyles.header}>
                                    <div className={cellStyles.title}>
                                        {this.props.cell.metadata.kbase &&
                                            this.props.cell.metadata.kbase
                                                .attributes
                                            ? this.props.cell.metadata.kbase
                                                .attributes.title
                                            : 'n/a'}
                                    </div>
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
