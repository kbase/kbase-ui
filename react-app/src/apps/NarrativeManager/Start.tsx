import { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AuthenticationState } from '../../contexts/Auth';
import { Config } from '../../types/config';

export interface NarrativeManagerStartProps extends RouteComponentProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface NarrativeManagerStartState {}

export default class NarrativeManagerStart extends Component<
    NarrativeManagerStartProps,
    NarrativeManagerStartState
> {
    render() {
        return <div>Narrative Manager Start</div>;
    }
}
