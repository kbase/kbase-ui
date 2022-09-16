import { Component } from 'react';
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
    syncHash: boolean;
    whenMounted: (el: Window | null) => Promise<void>;
}

interface IFrameState { }

export default class IFrame extends Component<IFrameProps, IFrameState> {
    id: string;
    url: string;
    hashListener: (() => void) | null;
    constructor(props: IFrameProps) {
        super(props);

        const id = uuid.v4();
        this.id = `frame_${id}`;

        const hashPath = this.props.original
            .split('/')
            .filter((pathElement) => {
                return pathElement.length > 0;
            })
            .join('/')

        // const indexPath = `${this.props.pathRoot}/iframe_root/index.html${this.cacheBuster()}#/${hashPath}`

        const indexPath = `${this.props.pathRoot}/iframe_root/index.html${this.cacheBuster()}#${hashPath}`

        // const indexPath = [
        //     this.props.pathRoot,
        //     '/iframe_root/index.html',
        //     this.cacheBuster(),
        //     '#/',
        //     this.props.original,
        // ].join('');

        // Make an absolute url to this.
        const url = `${document.location.origin}/${indexPath}`;
        // this.url = '/' + indexPath;
        this.url = url;
        this.hashListener = null;
    }

    componentDidMount() {
        // NB cannot use react ref for this, because react under Safari
        // has a bug which prevents the iframe from loading when
        // a ref is placed on it.
        const element = document.getElementById(this.id);
        if (element === null) {
            console.warn('yikes!');
            return;
        }
        this.loaded(element as HTMLIFrameElement);
    }

    cacheBusterKey(buildInfo: BuildInfo, developMode: boolean) {
        // NB developMode not implemented yet, so always defaults
        // to the gitCommitHash

        return 'foo';

        // if (developMode) {
        //     return String(new Date().getTime());
        // } else {
        //     return buildInfo.git.hash.abbreviated;
        // }
    }

    cacheBuster() {
        // TODO: get develop mode from runtime
        return '?cb=' + this.cacheBusterKey(this.props.config.build, false);
    }

    loaded(element: HTMLIFrameElement) {
        // This will update the hash for the iframe url to match
        // that of the parent kbase-ui window, which may trigger
        // navigation if the plugin handles that by itself.
        if (this.props.syncHash) {
            const hashListener = () => {
                if (
                    element.contentWindow === null
                ) {
                    return;
                }
                const path = document.location.hash
                    .substring(1)
                    .replace(/^\/+/, '');
                element.contentWindow.location.hash = path;
            }
            window.addEventListener('hashchange', hashListener);
        }
        this.props.whenMounted(element.contentWindow);
    }

    componentWillUnmount() {
        if (this.hashListener) {
            window.removeEventListener('hashchange', this.hashListener);
        }
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
                src={this.url}
            ></iframe>
        );
    }
}
