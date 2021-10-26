import {Component} from 'react';
import {AuthenticationState} from '../contexts/Auth';
import {JSONObject} from '../lib/json';
import {Messenger} from '../lib/messenger';
import {Config} from '../types/config';
import IFrameController, {IFrameControllerProps} from './IFrameController';
import './Plugin.css';

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
    // hmm
    config: Config;
    authState: AuthenticationState;
    messenger: Messenger;
}

interface PluginState {
}

export default class Plugin extends Component<PluginProps, PluginState> {
    constructor(props: PluginProps) {
        super(props);
        const {params} = props;

        if (params.viewParams) {
            params.viewParams = JSON.parse(params.viewParams);
        }
    }

    componentDidMount() {
        this.props.setTitle('');
    }

    render() {
        const pluginPath = ['modules', 'plugins', this.props.name].join('/');

        const props: IFrameControllerProps = {
            pluginPath,
            pluginName: this.props.name,
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
