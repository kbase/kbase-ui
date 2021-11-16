import { Component } from 'react';
import { AppCellIcon, DefaultIcon, TypeIcon } from '../Icon';
import { AuthInfo } from '../../../../contexts/Auth';
import { Config } from '../../../../types/config';
import styles from './PreviewCell.module.css';

interface PreviewCellProps {
    cellType: string;
    title: string;
    subtitle?: string;
    metaName: string; // context dependent - either app id, obj type, null
    tag?: string | null;
    authInfo: AuthInfo;
    config: Config;
}

export class PreviewCell extends Component<PreviewCellProps> {
    render() {
        let icon;
        const tag = this.props.tag || 'dev';
        switch (this.props.cellType) {
            case 'app':
                icon = (
                    <AppCellIcon
                        appId={this.props.metaName}
                        appTag={tag}
                        authInfo={this.props.authInfo}
                        config={this.props.config}
                    />
                );
                break;
            case 'data':
                icon = (
                    <TypeIcon
                        objectType={this.props.metaName}
                        authInfo={this.props.authInfo}
                        config={this.props.config}
                    />
                );
                break;
            default:
                icon = <DefaultIcon cellType={this.props.cellType} />;
                break;
        }
        // const title = this.props.title;
        // const subtitleRaw = this.props.subtitle || '';
        // eslint-disable-next-line new-cap
        // let subtitle = DOMPurify.sanitize(marked(subtitleRaw), {
        //   ALLOWED_TAGS: [],
        // });
        // if (subtitle.startsWith(title)) {
        //   subtitle = subtitle.slice(title.length);
        // }
        const subtitle = (() => {
            if (this.props.subtitle) {
                if (this.props.subtitle.startsWith(this.props.title)) {
                    return this.props.subtitle.slice(this.props.title.length);
                }
                return this.props.subtitle;
            }
            return null;
        })();
        return (
            <div className="PreviewCell row my-2">
                <div className="col-auto">{icon}</div>
                <div className="col" style={{ minWidth: 0 }}>
                    <div className={styles.title}>{this.props.title}</div>
                    <div className={styles.subtitle}>{subtitle}</div>
                </div>
            </div>
        );
    }
}
