import React, {Component} from 'react';
import {AppCellIcon, DefaultIcon, TypeIcon} from '../generic/Icon';
import NarrativeModel, {Doc} from '../../utils/NarrativeModel';
import {AuthInfo} from "../../../../contexts/Auth";
import {Config} from "../../../../types/config";
import './Preview.css';

interface Props {
    authInfo: AuthInfo;
    config: Config;
    narrative: Doc;
}

interface State {
    isLoading: boolean;
    cells: Array<any>;
    error: any;
}

interface PreviewCellProps {
    cellType: string;
    title: string;
    subtitle?: string;
    metaName: string; // context dependent - either app id, obj type, null
    tag?: string | null;
    authInfo: AuthInfo;
    config: Config;
}

export default class Preview extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isLoading: true,
            cells: [],
            error: null,
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (
            prevProps.narrative.access_group !== this.props.narrative.access_group ||
            prevProps.narrative.obj_id !== this.props.narrative.obj_id ||
            prevProps.narrative.version !== this.props.narrative.version
        ) {
            this.fetchNarrativeObject();
        }
    }

    componentDidMount() {
        this.fetchNarrativeObject();
    }

    async fetchNarrativeObject() {
        this.setState({isLoading: true});
        const {narrative} = this.props;
        const {access_group, obj_id, version} = narrative;
        const upa = `${access_group}/${obj_id}/${version}`;
        try {
            const narrativeModel = new NarrativeModel({
                workspaceURL: this.props.config.services.Workspace.url,
                token: this.props.authInfo.token

            });
            const narrative = await narrativeModel.fetchNarrative(upa);
            const cells = narrative.cells ? narrative.cells : [];
            this.setState({
                isLoading: false,
                cells,
                error: null,
            });
        } catch (error) {
            this.setState({isLoading: false, error: error});
        }
    }

    render() {
        if (this.state.isLoading) {
            return (
                <div className="">
                    <p className="">
                        <i className="fa fa-cog fa-spin"></i>
                        Loading...
                    </p>
                </div>
            );
        } else if (this.state.error) {
            return this.renderError(this.state.error);
        }
        const maxLength = 16;

        const truncated = this.state.cells.slice(0, maxLength);

        const rows = truncated.map((cell, idx) => {
            const metadata = cell.metadata?.kbase || {};
            const title = metadata?.attributes?.title;
            const subtitle = metadata?.attributes?.subtitle || cell.source;
            const cellType = metadata.type ? metadata.type : cell.cell_type;
            const info = metadata?.dataCell?.objectInfo || {};
            let metaName = null;
            let tag = null;
            switch (cellType) {
                case 'app':
                    metaName = metadata?.appCell?.app?.id;
                    tag = metadata?.appCell?.app?.tag;
                    break;
                case 'data':
                    metaName = info?.typeName;
                    if (!metaName) {
                        metaName = info?.type;
                    }
                    break;
            }
            return (
                <PreviewCell
                    key={idx}
                    title={title}
                    cellType={cellType}
                    metaName={metaName}
                    subtitle={subtitle}
                    tag={tag}
                    authInfo={this.props.authInfo}
                    config={this.props.config}
                />
            );
        });

        let moreCells = null;
        if (this.state.cells.length > maxLength) {
            const extraCells = this.state.cells.length - maxLength;
            moreCells = (
                <p>
                    + {extraCells} more cell{extraCells > 1 ? 's' : ''}
                </p>
            );
        }
        return (
            <div>
                <div>{rows}</div>
                {moreCells}
                {this.viewFullNarrativeLink(this.props.narrative.access_group)}
            </div>
        );
    }

    viewFullNarrativeLink(wsid: number) {
        const narrativeHref = `/narrative/${wsid}`;
        return (
            <p>
                <a className="no-underline" href={narrativeHref}>
                    View the full narrative
                </a>
            </p>
        );
    }

    renderError(error: any) {
        const msg = error?.data?.message;
        return (
            <div className="">
                <div>An error happened while getting narrative info:</div>
                <pre>{msg}</pre>
            </div>
        );
    }
}

export class PreviewCell extends Component<PreviewCellProps> {
    render() {
        let icon;
        const tag = this.props.tag || 'dev';
        switch (this.props.cellType) {
            case 'app':
                icon = <AppCellIcon appId={this.props.metaName} appTag={tag} authInfo={this.props.authInfo}
                                    config={this.props.config}/>;
                break;
            case 'data':
                icon = <TypeIcon objectType={this.props.metaName} authInfo={this.props.authInfo}
                                 config={this.props.config}/>;
                break;
            default:
                icon = <DefaultIcon cellType={this.props.cellType}/>;
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
            <div className="Preview row my-2">
                <div className="col-auto">{icon}</div>
                <div className="col" style={{minWidth: 0}}>
                    <div className="-title">{this.props.title}</div>
                    <div className="-subtitle">
                        {subtitle}
                    </div>
                </div>
            </div>
        );
    }
}
