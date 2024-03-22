import { Component } from 'react';
import * as uuid from 'uuid';
import { Config, GitInfo } from '../types/config';
import styles from './IFrame.module.css';

export interface PluginGitInfo {
    commitHash: string;
    commitAbbreviatedHash: string;
    authorName: string;
    authorDate: string;
    committerName: string;
    committerDate: string;
    reflogSelector: string;
    subject: string;
    commitNotes: string;
    originUrl: string;
    branch: string;
    tag: string;
    version: string;
}

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

        const indexPath = `${this.props.pathRoot}/iframe_root/index.html${this.cacheBuster()}#${hashPath}`

        // Make an absolute url to this.
        // The plugin is always on the same host as kbase-ui

        const url = `${document.location.origin}/${indexPath}`;
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

    cacheBusterKey(gitInfo: GitInfo, developMode: boolean) {
        // NB developMode not implemented yet, so always defaults
        // to the gitCommitHash

        if (developMode) {
            return String(new Date().getTime());
        } else {
            return gitInfo.hash.abbreviated
        }
    }

    cacheBuster() {
        // TODO: get develop mode from runtime
        return '?cb=' + this.cacheBusterKey(this.props.config.gitInfo, false);
    }

    loaded(element: HTMLIFrameElement) {
        // This will update the hash for the iframe url to match
        // that of the parent kbase-ui window, which may trigger
        // navigation if the plugin handles that by itself.
        // If not, it is harmless.
        // Supports navigation via kbase-ui into plugins.
        // A plugin which plays nice will set the url fragment for kbase-ui, which will
        // flow back to the plugin, but allow the kbase-ui location to reflect that of
        // the plugin.
        // Some older plugins may not place nice like this, and will have their internal
        // navigation obscured since it is only on the iframe. Some plugins don't use
        // any browser navigation, just using state and components.
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

    gitInfoToPluginGitInfo(gitInfo: GitInfo): PluginGitInfo {
        return {
            authorDate: gitInfo.author.date,
            authorName: gitInfo.author.name,
            committerDate: gitInfo.committer.date,
            committerName: gitInfo.committer.name,
            branch: gitInfo.branch, // unused?
            commitAbbreviatedHash: gitInfo.hash.abbreviated,
            commitHash: gitInfo.hash.full,
            commitNotes: "",
            originUrl: gitInfo.originURL,
            reflogSelector: "",
            subject: "",
            tag: gitInfo.tag || "n/a",
            version: gitInfo.version || "n/a"
        }
    }

    render() {
        const buildInfo = {
            git: this.gitInfoToPluginGitInfo(this.props.config.gitInfo),
            builtAt: this.props.config.buildInfo.builtAt,
        }

        const params = {
            frameId: this.id,
            parentHost: document.location.origin,
            buildInfo,
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
                className={styles.main}
                scrolling="no"
                allow="clipboard-read; clipboard-write;"
                // sandbox="allow-same-origin allow-downloads allow-forms allow-modals allow-popups allow-scripts"
                src={this.url}
            ></iframe>
        );
    }
}
