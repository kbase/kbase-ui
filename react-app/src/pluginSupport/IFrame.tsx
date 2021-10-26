import { Component, createRef, RefObject } from 'react';
import * as uuid from 'uuid';
import { BuildInfo, Config } from '../types/config';
import './IFrame.css';

export interface IFrameProps {
    pathRoot: string;
    original: string;
    origin: string;
    config: Config;
    params: { [k: string]: string };
    hostChannelId: string;
    pluginChannelId: string;
    whenMounted: (el: Window | null) => Promise<void>;
}

interface IFrameState {}

export default class IFrame extends Component<IFrameProps, IFrameState> {
    id: string;
    ref: RefObject<HTMLIFrameElement>;
    url: string;
    constructor(props: IFrameProps) {
        super(props);

        // const {
        //     origin, pathRoot, channelId, hostId,
        //     params, runtime
        // } = props;

        const id = uuid.v4();
        this.id = `frame_ ${id}`;

        this.ref = createRef();

        const indexPath = [
            this.props.pathRoot,
            '/iframe_root/index.html',
            this.cacheBuster(),
            '#',
            this.props.original,
        ].join('');

        // Make an absolute url to this.
        this.url = process.env.PUBLIC_URL + '/' + indexPath;
    }

    cacheBusterKey(buildInfo: BuildInfo, developMode: boolean) {
        // NB developMode not implemented yet, so always defaults
        // to the gitCommitHash
        if (developMode) {
            return String(new Date().getTime());
        } else {
            return buildInfo.git.commitHash;
        }
    }

    cacheBuster() {
        // TODO: get develop mode from runtime
        return '?cb=' + this.cacheBusterKey(this.props.config.build, false);
    }

    componentDidMount() {
        if (this.ref.current === null) {
            return;
        }
        window.addEventListener('hashchange', (ev: Event) => {
            if (
                this.ref.current === null ||
                this.ref.current.contentWindow === null
            ) {
                return;
            }
            const path = document.location.hash
                .substring(1)
                .replace(/^\/+/, '');
            this.ref.current.contentWindow.location.hash = path;
        });
        this.props.whenMounted(this.ref.current.contentWindow);
    }

    render() {
        const params = {
            frameId: this.id,
            parentHost: document.location.origin,
            buildInfo: this.props.config.build,
            developMode: false,
            params: this.props.params,
            channelId: this.props.hostChannelId,
            hostChannelId: this.props.hostChannelId,
            pluginChannelId: this.props.pluginChannelId,
        };

        const paramString = window.encodeURIComponent(JSON.stringify(params));

        return (
            <iframe
                title="Plugin IFrame"
                id={this.id}
                name={this.id}
                data-k-b-testhook-iframe="plugin-iframe"
                data-params={paramString}
                data-channel-id={this.props.hostChannelId}
                data-host-channel-id={this.props.hostChannelId}
                data-plugin-channel-id={this.props.pluginChannelId}
                className="IFrame -iframe"
                frameBorder="0"
                scrolling="no"
                ref={this.ref}
                src={this.url}
            ></iframe>
        );
    }
}
