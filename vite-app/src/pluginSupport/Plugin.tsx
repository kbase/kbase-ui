import { Component } from 'react';
import { AuthenticationState } from '../contexts/Auth';
import { JSONObject } from '../lib/json';
import { Messenger } from '../lib/messenger';
import { Config } from '../types/config';
import IFrameController, { IFrameControllerProps } from './IFrameController';
import './Plugin.css';

/**
 * TODO:
 * let us try this:
 * treat this as an async component
 * first, it is NONE, then we check for existence of the plugin's index file by 
 * attempting to load it. If that succeeds we will then proceed to load
 * the iframe controller.
 * z
 */

export interface Params {
    [key: string]: string;
}

export interface PluginData extends JSONObject {
    view: string;
    params: Params;
}

export interface PluginProps {
    setTitle: (title: string) => void;
    name: string;
    view: string;
    original: string; // original what?
    params: Params;
    syncHash: boolean;
    // hmm
    config: Config;
    authState: AuthenticationState;
    messenger: Messenger;
}


export default class Plugin extends Component<PluginProps> {
    constructor(props: PluginProps) {
        super(props);
        const { params } = props;

        if (params.viewParams) {
            params.viewParams = JSON.parse(params.viewParams);
        }
    }

    componentDidMount() {
        this.props.setTitle('');
    }

    componentDidUpdate(prevProps: PluginProps) {
        if (prevProps.name !== this.props.name) {
            // this.forceUpdate();
            // If the plugin name changed, we want to check that it has 
        }
    }

    render() {
        // TODO: document the location of runtime configurations,
        // which accessed in /deploy, which needs to be mounted into
        // the container.
        const basePath = this.props.config.deploy.basePath.split('/').filter((pathElement) => { return pathElement.length > 0 });
        const pluginPath = basePath.concat(['plugins', this.props.name]).join('/');

        const props: IFrameControllerProps = {
            pluginPath,
            pluginName: this.props.name,
            syncHash: this.props.syncHash,
            key: this.props.name,
            original: this.props.original,
            view: this.props.view,
            routeParams: this.props.params || {},
            config: this.props.config,
            authState: this.props.authState,
            setTitle: this.props.setTitle,
            messenger: this.props.messenger,
        };

        return (
            <div className="Plugin">
                <IFrameController {...props} />
            </div>
        );
    }
}
