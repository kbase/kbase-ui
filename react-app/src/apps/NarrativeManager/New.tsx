import { Component } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { AuthenticationState } from '../../contexts/Auth';
import { Config } from '../../types/config';

export interface NarrativeManagerNewProps extends RouteComponentProps {
    config: Config;
    authState: AuthenticationState;
    setTitle: (title: string) => void;
}

interface NarrativeManagerNewState {}

export default class NarrativeManagerNew extends Component<
    NarrativeManagerNewProps,
    NarrativeManagerNewState
> {
    render() {
        return <div>Narrative Manager New</div>;
    }
}
