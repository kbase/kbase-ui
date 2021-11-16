import { Component } from 'react';
import { AppCellIcon } from '../../Icon';
import { AuthInfo } from '../../../../../contexts/Auth';
import { Config } from '../../../../../types/config';
import { AppCell } from '../../../utils/NarrativeModel';
import styles from './AppCell.module.css';
import marked from 'marked';
import DOMPurify from 'dompurify';
import { Accordion } from 'react-bootstrap';

interface PreviewCellProps {
    cell: AppCell;
    authInfo: AuthInfo;
    config: Config;
}

export default class AppCellView extends Component<PreviewCellProps> {
    renderDescription(description: string | null) {
        if (description === null || description.trim().length === 0) {
            return <div style={{ fontStyle: 'italic' }}>no description</div>;
        }
        return (
            <div
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(marked(description)),
                }}
            />
        );
    }

    render() {
        const icon = (
            <AppCellIcon
                appId={this.props.cell.metadata.kbase.appCell.app.id}
                authInfo={this.props.authInfo}
                config={this.props.config}
                appTag={this.props.cell.metadata.kbase.appCell.app.tag}
            />
        );
        // const title = this.props.title;
        // const subtitleRaw = this.props.subtitle || '';
        // eslint-disable-next-line new-cap
        // let subtitle = DOMPurify.sanitize(marked(subtitleRaw), {
        //   ALLOWED_TAGS: [],
        // });
        // if (subtitle.startsWith(title)) {
        //   subtitle = subtitle.slice(title.length);
        // }
        const {
            app: {
                id,
                version,
                spec: {
                    info: { name, subtitle },
                    full_info,
                },
            },
        } = this.props.cell.metadata.kbase.appCell;

        const description = (() => {
            if (typeof full_info !== 'undefined') {
                return full_info.description;
            }
            return null;
        })();

        // const theSubtitle = (() => {
        //     if (subtitle) {
        //         if (subtitle.startsWith(title)) {
        //             return subtitle.slice(title.length);
        //         }
        //         return subtitle;
        //     }
        //     return null;
        // })();
        return (
            <div className="row my-2">
                <div className="col-auto d-flex align-items-center">{icon}</div>
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
                                    <div className={styles.title}>{name} </div>
                                    <div className={styles.version}>
                                        version {version}
                                    </div>
                                    {/* <div className={styles.title}>{title}</div> */}
                                </div>
                            </Accordion.Header>
                            <Accordion.Body>
                                <div className={styles.id}>
                                    <a
                                        href={`/#spec/type/${id}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        {id} ({version})
                                    </a>
                                </div>
                                <div className={styles.subtitle}>
                                    {subtitle}
                                </div>
                                <div className={styles.description}>
                                    {this.renderDescription(description)}
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </div>
        );
    }
}
