import { Component } from 'react';
import { AuthenticationState } from '../../contexts/Auth';
import { Config } from '../../types/config';
import AboutCoreServices from './AboutCoreServices';

export interface AboutKBaseUIProps {
    config: Config;
    setTitle: (title: string) => void;
    authState: AuthenticationState;
}

interface AboutKBaseUIState {}

export default class AboutKBaseUI extends Component<
    AboutKBaseUIProps,
    AboutKBaseUIState
> {
    render() {
        return <AboutCoreServices {...this.props} />;
    }
}
